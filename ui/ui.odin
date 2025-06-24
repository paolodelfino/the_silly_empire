package ui

import ft "../freetype"
import "base:intrinsics"
import "base:runtime"
import "core:bytes"
import "core:c"
import "core:fmt"
import "core:math"
import "core:math/linalg/glsl"
import "core:mem"
import "core:slice"
import "core:strconv"
import "core:strings"
import win32 "core:sys/windows"
import "core:time"
import gl "vendor:OpenGL"
import "vendor:glfw"
import vk "vendor:vulkan"


// Where I use ^Widget_Common, I probably mean that it's a pointer to the full widget

Button_State :: struct {
	is_down, is_press, is_drag: bool,
	//            ^ All these three are strange, I have to take
	//							another look at them.
	drag_start_position:        [2]f32,
	last_pressed_time:          time.Time,
	widget_down:                ^Widget_Common,
	// widget_press:               ^Widget_Common, Maybe leave it and rename it to last_widget_press
	widget_drag:                ^Widget_Common,
	widget_active:              ^Widget_Common,
}

Modifier :: enum {
	Alt,
	Shift,
	Control,
	Super,
	Caps_Lock,
	Num_Lock,
}

Modifiers :: bit_set[Modifier]

// Given how Window handles layout and paint events, how
// Panel does and how the other widgets do, it's probably most
// useful to use a Panel as Window's child
Window :: struct {
	using common:                  Widget_Common,
	handle:                        glfw.WindowHandle,
	offscreen_framebuffer_texture: u32, //													It's the offscreen buffer's color attachment
	//																															to post-process pixels to gamma-corrected space.
	offscreen_framebuffer:         u32, //                          Used in order to remove necessity of redrawing everything in every
	//																															new frame.
	cursors:                       [Cursor]glfw.CursorHandle,
	cursor:                        Cursor,
	widget_hover:                  ^Widget_Common,
	modifiers:                     Modifiers,
	button_index_to_state:         [Key_Button_Count]Button_State,
	mouse_position:                [2]f32,
	scale:                         f32, //													Scale is already set by platform-specific code.
	repaint_region:                [4]f32, //												Use widget_mark_repaint() or widget_mark_refresh() or widget_mark_refresh_all().
	//																															It always has to be in windows.bounds boundary.
	parent_stack:                  [32]^Widget_Common,
	parent_stack_count:            int,
	animate_widgets:               [dynamic]^Widget_Common,
	is_inactive:                   bool,
	ft:                            ft.Library,
	font_created:                  [32]^Font,
	font_created_count:            int,
	font_stack:                    [32]int,
	font_stack_count:              int,
	frame_time:                    time.Duration, //								Tecnically, when you access it, it's probably last frame's metric.
	_context:                      runtime.Context, // 							window._context = context In order to take track of more allocations when needed.
}

WINDOW_DEFAULT_FRAMEBUFFER: u32 : 0
OFFSCREEN_FRAMEBUFFER_TEXTURE: i32 : 0

// Gli eventi basilari vengono utilizzati comunemente in un certo modo,
// da qui dei comportamenti idiomatici. Per evitare rindondanza, creazione
// di complessità e diminuzione di performance, ho deciso di implementare
// una soluzione ai comportamenti idiomatici, da qui gli stati idiomatici
// in cui un widget può essere e che gli permettono di ricevere certi eventi
// basilari, ad esempio un key press, e composti, ad esempio, un drag che ritorna
// un drag delta. Per aggiunta, permettere a qualcunque widget in qualunque
// stato di ricevere qualunque evento, rendenderebbe vana, insensata e il
// sistema più complesso l'implementazione dei comportamenti idiomatici.
Widget_State :: enum {
	Hover,
	Down,
	Press,
	Drag,
	Active,
}
Widget_States :: bit_set[Widget_State]

widget_state_refresh :: proc(
	state: Widget_State,
	button := Key.Invalid,
) -> (
	is_state_change: bool,
) {
	assert(button_key_is_valid(button))
	previous_widget, widget: ^Widget_Common = ---, ---
	widget_state_msg: Message = ---

	switch state {
	case .Hover:
		{
			widget_state_msg = .Widget_State_Hover
			assert(button == .Invalid, "For system simplicity always use .Invalid for .Hover")

			previous_widget = window.widget_hover
			walk_widget :: proc(
				widget: ^Widget_Common,
				intersection_carry: [4]f32,
			) -> ^Widget_Common {
				intersection_clip, is_intersect := rect_intersect(
					intersection_carry,
					widget.bounds,
					[4]f32{window.mouse_position.x, window.mouse_position.y, 1, 1},
				)
				if is_intersect {
					for child in widget.children {
						child_hovered := walk_widget(child, intersection_clip)
						if child_hovered != nil && .Hoverable in child_hovered.flags && .Disabled not_in child_hovered.flags do return child_hovered
					}
					if .Hoverable in widget.flags && .Disabled not_in widget.flags do return widget
				}
				return nil
			}
			window.widget_hover = walk_widget(window, window.bounds)
			widget = window.widget_hover
		}

	case .Down:
		{
			widget_state_msg = .Widget_State_Down
			button_state := button_key_to_state(button)
			previous_widget = button_state.widget_down
			if button_state.is_down {
				if button_state.widget_down == nil &&
				   window.widget_hover != nil &&
				   (.Downable_All_Buttons in window.widget_hover.flags ||
						   button_key_and_state_to_flag(button, .Down) in
							   window.widget_hover.flags) {
					button_state.widget_down = window.widget_hover
				}
			} else {
				if button_state.widget_down != nil {
					button_state.widget_down = nil
				}
			}
			widget = button_state.widget_down
		}

	case .Active:
		{
			widget_state_msg = .Widget_State_Active
			button_state := button_key_to_state(button)
			previous_widget = button_state.widget_active
			if button_state.is_press {
				if button_state.widget_down == window.widget_hover &&
				   window.widget_hover != nil &&
				   (.Activable_All_Buttons in window.widget_hover.flags ||
						   button_key_and_state_to_flag(button, .Active) in
							   window.widget_hover.flags) {
					button_state.widget_active = window.widget_hover
				}
			}
			widget = button_state.widget_active
		}

	case .Press:
		{
			widget_state_msg = .Widget_State_Press
			button_state := button_key_to_state(button)
			previous_widget = nil
			if button_state.is_press &&
			   button_state.widget_down == window.widget_hover &&
			   window.widget_hover != nil &&
			   (.Pressable_All_Buttons in window.widget_hover.flags ||
					   button_key_and_state_to_flag(button, .Press) in window.widget_hover.flags) {
				widget = window.widget_hover
			} else {
				widget = nil
			}
		}

	case .Drag:
		{
			widget_state_msg = .Widget_State_Drag
			button_state := button_key_to_state(button)
			previous_widget = button_state.widget_drag
			if button_state.is_drag {
				if button_state.widget_drag == nil &&
				   window.widget_hover != nil &&
				   (.Draggable_All_Buttons in window.widget_hover.flags ||
						   button_key_and_state_to_flag(button, .Drag) in
							   window.widget_hover.flags) {
					button_state.widget_drag = window.widget_hover
				}
			} else {
				if button_state.widget_drag != nil {
					button_state.widget_drag = nil
				}
			}
			widget = button_state.widget_drag
		}
	}

	is_state_change = previous_widget != widget
	if is_state_change {
		event_ctx: Event_Widget_State_Ctx = {
			button = button,
		}
		if previous_widget != nil {
			event_ctx.enter = false
			send_message(previous_widget, widget_state_msg, &event_ctx)
		}
		if widget != nil {
			event_ctx.enter = true
			send_message(widget, widget_state_msg, &event_ctx)
		}
	}

	return
}

// Not all the passes are followed. For example,
// a widget to naturally enter down state needs
// to be hovered first; instead, if you force it,
// it will enter down state directly.
//
// Furthermore, naturally you need hoverability
// for downability, but here you skip that too,
// at the moment.
widget_state_force :: proc(
	widget: ^$Widget,
	state: Widget_State,
	button: Key = .Invalid,
	// by_simulation := false,
	// skip_passes := true,
) -> (
	is_state_change: bool,
) where intrinsics.type_elem_type(Widget) == Widget_Common || intrinsics.type_has_field(Widget, "common") {
	Key_Enum_Underlying_Type :: intrinsics.type_core_type(Key)
	assert(button_key_is_valid(button))
	previous_widget: ^Widget_Common = ---
	widget_state_msg: Message = ---

	switch state {
	case .Hover:
		{
			widget_state_msg = .Widget_State_Hover
			assert(widget == nil || (.Hoverable in widget.flags && .Disabled not_in widget.flags))
			assert(button == .Invalid, "For system simplicity always use .Invalid for .Hover")
			previous_widget, window.widget_hover = window.widget_hover, widget
		}

	case .Down:
		{
			widget_state_msg = .Widget_State_Down
			assert(
				widget == nil ||
				((.Downable_All_Buttons in widget.flags ||
							button_key_and_state_to_flag(button, .Down) in widget.flags) &&
						.Disabled not_in widget.flags),
			)
			button_state := button_key_to_state(button)
			previous_widget, button_state.widget_down = button_state.widget_down, widget
		}

	case .Active:
		{
			widget_state_msg = .Widget_State_Active
			assert(
				widget == nil ||
				((.Activable_All_Buttons in widget.flags ||
							button_key_and_state_to_flag(button, .Active) in widget.flags) &&
						.Disabled not_in widget.flags),
			)
			button_state := button_key_to_state(button)
			previous_widget, button_state.widget_active = button_state.widget_active, widget
		}

	case .Press:
		{
			widget_state_msg = .Widget_State_Press
			assert(
				widget == nil ||
				((.Pressable_All_Buttons in widget.flags ||
							button_key_and_state_to_flag(button, .Press) in widget.flags) &&
						.Disabled not_in widget.flags),
			)
			button_state := button_key_to_state(button)
			previous_widget = nil
		}

	case .Drag:
		{
			widget_state_msg = .Widget_State_Drag
			assert(
				widget == nil ||
				((.Draggable_All_Buttons in widget.flags ||
							button_key_and_state_to_flag(button, .Drag) in widget.flags) &&
						.Disabled not_in widget.flags),
			)
			button_state := button_key_to_state(button)
			previous_widget, button_state.widget_drag = button_state.widget_drag, widget
			button_state.drag_start_position = window.mouse_position
		}
	}

	is_state_change = previous_widget != widget
	if is_state_change {
		event_ctx: Event_Widget_State_Ctx = {
			button = button,
			forced = true,
		}
		if previous_widget != nil {
			event_ctx.enter = false
			send_message(previous_widget, widget_state_msg, &event_ctx)
		}
		if widget != nil {
			event_ctx.enter = true
			send_message(widget, widget_state_msg, &event_ctx)
		}
	}
	return
}

widget_is_hover :: proc(widget: ^Widget_Common) -> bool {
	return window.widget_hover == widget
}

widget_is_down :: proc(widget: ^Widget_Common, button: Key, loc := #caller_location) -> bool {
	#no_bounds_check {
		button_state := window.button_index_to_state[button_key_to_index(button, loc = loc)]
		return button_state.widget_down == widget
	}
}

widget_is_active :: proc(widget: ^Widget_Common, button: Key, loc := #caller_location) -> bool {
	#no_bounds_check {
		button_state := window.button_index_to_state[button_key_to_index(button, loc = loc)]
		return button_state.widget_active == widget
	}
}

widget_is_drag :: proc(widget: ^Widget_Common, button: Key, loc := #caller_location) -> bool {
	#no_bounds_check {
		button_state := window.button_index_to_state[button_key_to_index(button, loc = loc)]
		return button_state.widget_drag == widget
	}
}

widget_disable :: proc(widget: ^Widget_Common, enable := false) {
	assert(widget != nil)
	if (enable && .Disabled not_in widget.flags) || (!enable && .Disabled in widget.flags) do return

	is_disabled: bool = ---

	if enable {
		widget.flags -= {.Disabled}
		is_disabled = false
		send_message(widget, .Widget_Disabled, &is_disabled)
		if .Hoverable in widget.flags {
			widget_state_refresh(.Hover)
		}
		return
	}

	widget.flags += {.Disabled}
	if window.widget_hover == widget {
		widget_state_refresh(.Hover)
	}
	for i in 0 ..< Key_Button_Count {
		button_state := window.button_index_to_state[i]
		button_key := button_index_to_key(i)
		if widget == button_state.widget_down {
			widget_state_force(cast(^Widget_Common)nil, .Down, button_key)
		}
		if widget == button_state.widget_active {
			widget_state_force(cast(^Widget_Common)nil, .Active, button_key)
		}
		if widget == button_state.widget_drag {
			widget_state_force(cast(^Widget_Common)nil, .Drag, button_key)
		}
	}
	is_disabled = true
	send_message(widget, .Widget_Disabled, &is_disabled)
}

button_key_is_valid :: proc(key: Key) -> bool {
	return(
		key == .Invalid ||
		(transmute(int)Key_Button_Start <= transmute(int)key &&
				transmute(int)key < transmute(int)Key_Button_Start + Key_Button_Count) \
	)
}

button_index_is_valid :: proc(index: int) -> bool {
	return index == -1 || (0 <= index && index < Key_Button_Count)
}

button_index_to_key :: proc(
	index: int,
	loc := #caller_location,
	assert_ok := true,
) -> (
	key: Key,
	ok: bool,
) #optional_ok {
	if index == -1 {
		ok = true
		key = .Invalid
	} else {
		ok = 0 <= index && index < Key_Button_Count
		key = transmute(Key)(transmute(int)Key_Button_Start + index)
	}

	if assert_ok {
		assert(ok, loc = loc)
	}
	return
}

button_key_to_index :: proc(
	key: Key,
	loc := #caller_location,
	assert_ok := true,
) -> (
	index: int,
	ok: bool,
) #optional_ok {
	if key == .Invalid {
		ok = true
		index = -1
	} else {
		ok =
			transmute(int)Key_Button_Start <= transmute(int)key &&
			transmute(int)key < transmute(int)Key_Button_Start + Key_Button_Count
		index = transmute(int)key - transmute(int)Key_Button_Start
	}

	if assert_ok {
		assert(ok, loc = loc)
	}
	return
}

button_key_to_state :: proc(
	key: Key,
	loc := #caller_location,
	assert_ok := true,
) -> (
	state: ^Button_State,
	ok: bool,
) #optional_ok {
	index, ok_1 := button_key_to_index(key, loc = loc, assert_ok = false)
	ok = ok_1 && index != -1

	if ok {
		#no_bounds_check {
			state = &window.button_index_to_state[index]
		}
	}

	if assert_ok {
		assert(ok, loc = loc)
	}
	return
}

// 0 (Key.Left_Button) + Widget_State.Down = Widget_Flag.Downable_Left_Button
button_index_and_state_to_flag :: proc(
	index: int,
	state: Widget_State,
	loc := #caller_location,
	assert_ok := true,
) -> (
	flag: Widget_Flag,
	ok: bool,
) #optional_ok {
	ok = button_index_is_valid(index) && state != .Hover

	if ok {
		#no_bounds_check {
			flag = button_index_and_state_to_flag_map[index][state]
		}
	}

	if assert_ok {
		assert(ok, loc = loc)
	}
	return
}

// Key.Left_Button + Widget_State.Down = Widget_Flag.Downable_Left_Button
button_key_and_state_to_flag :: proc(
	key: Key,
	state: Widget_State,
	loc := #caller_location,
	assert_ok := true,
) -> (
	flag: Widget_Flag,
	ok: bool,
) #optional_ok {
	ok = state != .Hover

	if ok {
		#no_bounds_check {
			flag = button_index_and_state_to_flag_map[button_key_to_index(key, loc = loc)][state]
		}
	}

	if assert_ok {
		assert(ok, loc = loc)
	}
	return
}

button_index_and_state_to_flag_map := [Key_Button_Count][Widget_State]Widget_Flag {
	0 = {
		.Hover = .Invalid,
		.Down = .Downable_Left_Button,
		.Active = .Activable_Left_Button,
		.Press = .Pressable_Left_Button,
		.Drag = .Draggable_Left_Button,
	},
	1 = {
		.Hover = .Invalid,
		.Down = .Downable_Right_Button,
		.Active = .Activable_Right_Button,
		.Press = .Pressable_Right_Button,
		.Drag = .Draggable_Right_Button,
	},
	2 = {
		.Hover = .Invalid,
		.Down = .Downable_Middle_Button,
		.Active = .Activable_Middle_Button,
		.Press = .Pressable_Middle_Button,
		.Drag = .Draggable_Middle_Button,
	},
	3 = {
		.Hover = .Invalid,
		.Down = .Downable_X1_Button,
		.Active = .Activable_X1_Button,
		.Press = .Pressable_X1_Button,
		.Drag = .Draggable_X1_Button,
	},
	4 = {
		.Hover = .Invalid,
		.Down = .Downable_X2_Button,
		.Active = .Activable_X2_Button,
		.Press = .Pressable_X2_Button,
		.Drag = .Draggable_X2_Button,
	},
}

// Only meant to create and handle one for process right now
widget_make_window :: proc(title: string, width: int = -1, height: int = -1) -> ^Window {
	window = widget_make_common(
		Window,
		handler = proc(widget: rawptr, message: Message, event_ctx: rawptr) -> int {
			// fmt.println(message)

			#partial switch message {
			// Per adesso ci affidiamo ai predict (manuali). Altrimento possiamo andare con¹:
			//
			// ¹ Ho trovato un altra soluzione, che sarebe utilizzare .Relayout_Children così
			//   da far partire il relayout ai children come se lo faccesse la finestra e se
			//   lo usi in combinazione con .Relayout, fai anche il proprio relayout. Ma in
			//   realtà basterebbe una utility per markare per il relayout un range di elementi
			//   magari
			//
			// panel relayout handler:
			// for child in children
			// 	if typeof child is any kind panel:
			// 		send relayout signal
			// 	else if relayout in child's flags:
			// 		send relayout signal
			// 		remove relayout
			// 	get child width, height for own relayout
			// remove relayout
			//
			// panel repaint handler:
			// get intersection bounds window.repaint_region
			// paint background
			// for child in children
			// 	if intersect child.bounds window.repaint_region:
			// 		send paint signal
			// Note: Other elements take interesection clip on their own,
			// 		and they assume they intersect as all the other elements do
			//
			// - Non è che il tutto viene ricalcolato più volte oppure alcuni elementi
			// vengono saltati per la finestra non ha aspettato che tutti gli elementi venissero creati?
			// Collegato al fatto di creare un altro elemento al volo
			// - Relayout del tavolo, ad esempio
			// - Set parent in widget_make_common
			case .Widget_Layout:
				{
					walk_widget_relayout_0(window)
					walk_widget_relayout_0 :: proc(
						widget: ^$Widget,
					) where intrinsics.type_elem_type(Widget) == Widget_Common ||
						intrinsics.type_has_field(Widget, "common") {
						#reverse for child in widget.children {
							walk_widget_relayout_0(child)
						}

						if .Relayout in widget.flags {
							send_message(widget, .Widget_Layout_0)
						}
					}

					walk_widget_relayout_1(window)
					walk_widget_relayout_1 :: proc(
						widget: ^$Widget,
					) where intrinsics.type_elem_type(Widget) == Widget_Common ||
						intrinsics.type_has_field(Widget, "common") {
						if .Relayout in widget.flags {
							send_message(widget, .Widget_Layout_1)
							widget.flags -= {.Relayout}
						}

						for child in widget.children {
							walk_widget_relayout_1(child)
						}
					}
				}

			case .Widget_Paint:
				{
					for widget in window.children {
						walk_widget(widget, widget.bounds)
					}
					walk_widget :: proc(
						widget: ^$Widget,
						intersection_carry: [4]f32,
					) where intrinsics.type_elem_type(Widget) == Widget_Common ||
						intrinsics.type_has_field(Widget, "common") {
						intersect_clip, is_intersect := rect_intersect(
							intersection_carry,
							window.repaint_region,
							widget.bounds,
						)
						if is_intersect {
							send_message(widget, .Widget_Paint, &intersect_clip)

							for child in widget.children {
								walk_widget(child, intersect_clip)
							}
						}
					}
				}

			case .Window_Resized:
				{
					new_size := transmute(^[2]f32)event_ctx
					window.bounds.w = new_size.x
					window.bounds.z = new_size.y

					gl.Viewport(0, 0, i32(new_size.x), i32(new_size.y))

					gl.ActiveTexture(gl.TEXTURE0)
					gl.BindTexture(gl.TEXTURE_2D, window.offscreen_framebuffer_texture)
					gl.TexImage2D(
						gl.TEXTURE_2D,
						0,
						gl.RGBA32F,
						i32(new_size.x),
						i32(new_size.y),
						0,
						gl.RGBA,
						gl.FLOAT,
						nil,
					)

					// We now do all of these in callback passed to glfw.SetWindowRefreshCallback
					// widget_mark_refresh_all_in(window)
					// window_try_refresh_now()
				}

			case .Window_Minimized:
				{
					send_message(window, .Window_Resized, event_ctx)
				}

			case .Window_Maximized:
				{
					send_message(window, .Window_Resized, event_ctx)
				}

			// case .Window_Close:
			// 	{
			// 		// Do we really need to free memory? Come on, OS is gonna do it for us,
			// 		// as long as we're terminating the process too
			// 		// delete_widget :: proc(
			// 		// 	widget: ^$Widget,
			// 		// ) where intrinsics.type_elem_type(Widget) == Widget_Common ||
			// 		// 	intrinsics.type_has_field(Widget, "common") {
			// 		// 	for child in window.children {
			// 		// 		delete_widget(child)
			// 		// 	}
			// 		// 	delete(widget.children)
			// 		// 	free(widget)
			// 		// }
			// 		// delete_widget(window)
			// 	}

			case .Window_Scale_Change:
				{
					old_scale := cast(^f32)event_ctx

					for i in 0 ..< window.font_created_count {
						font_created := window.font_created[i]
						size_no_scale := font_created.size / old_scale^
						font_scaled := font_create_raw(font_created.file_path, size_no_scale)
						window.font_created[i] = font_scaled
						font_free(font_created)
					}

					// We now do all of these in callback passed to glfw.SetWindowRefreshCallback
					// widget_mark_refresh_all_in(window)
				}

			case .Input_Typed:
				{
					widget_notified: [Key_Button_Count]^Widget_Common
					widget_notified_count := 0

					for i in 0 ..< Key_Button_Count {
						button_state := window.button_index_to_state[i]
						if button_state.widget_active != nil &&
						   !widget_is_notified(
								   button_state.widget_active,
								   widget_notified,
								   widget_notified_count,
							   ) {
							widget_mark_notified(
								button_state.widget_active,
								&widget_notified,
								&widget_notified_count,
							)
							send_message(button_state.widget_active, .Input_Typed, event_ctx)
						}
					}

					widget_is_notified :: proc(
						widget: ^Widget_Common,
						widget_notified: [Key_Button_Count]^Widget_Common,
						widget_notified_count: int,
					) -> bool {
						for i in 0 ..< widget_notified_count {
							if widget_notified[i] == widget do return true
						}
						return false
					}

					widget_mark_notified :: proc(
						widget: ^Widget_Common,
						widget_notified: ^[Key_Button_Count]^Widget_Common,
						widget_notified_count: ^int,
					) {
						widget_notified[widget_notified_count^] = widget
						widget_notified_count^ += 1
					}
				}

			case .Input_Scroll:
				{
					if window.widget_hover != nil {
						send_message(window.widget_hover, .Input_Scroll, event_ctx)
					}
				}

			// case .Input_Files:
			// 	{
			// 		// event_ctx := transmute(^[]string)event_ctx
			// 		// defer for str in event_ctx do delete(str)
			// 		// defer delete(event_ctx^)

			// 		// Input_Files
			// 	}

			case .Input_Key:
				{
					event_ctx := transmute(^Event_Input_Key_Ctx)event_ctx

					#partial switch event_ctx.key {
					case .Left_Button, .Right_Button, .Middle_Button, .X1_Button, .X2_Button:
						{
							button_key := event_ctx.key
							button_state := button_key_to_state(button_key)
							is_double_press :=
								event_ctx.is_press &&
								(time.now()._nsec - button_state.last_pressed_time._nsec <=
										transmute(i64)(500 * time.Millisecond))
							if is_double_press {
								button_state.last_pressed_time._nsec = 0
							} else if event_ctx.is_press {
								button_state.last_pressed_time = time.now()
							}
							is_drag_start := !event_ctx.is_press
							is_drag_end := button_state.is_drag && event_ctx.is_press

							button_state.is_drag = is_drag_start
							if is_drag_start do button_state.drag_start_position = window.mouse_position
							button_state.is_down = !event_ctx.is_press
							button_state.is_press = event_ctx.is_press

							widget_down_is_state_change := false
							widget_active_is_state_change := false
							widget_drag_is_state_change := false
							if button_state.is_down {
								// Enter
								widget_down_is_state_change = widget_state_refresh(
									.Down,
									button_key,
								)
							}
							if button_state.is_press {
								// Enter
								widget_state_refresh(.Press, button_key)
								// Enter/Exit
								widget_active_is_state_change = widget_state_refresh(
									.Active,
									button_key,
								)
								// Exit
								widget_down_is_state_change = widget_state_refresh(
									.Down,
									button_key,
								)
								// Exit
								widget_drag_is_state_change = widget_state_refresh(
									.Drag,
									button_key,
								)
							}
							if button_state.is_drag {
								// Enter
								widget_drag_is_state_change = widget_state_refresh(
									.Drag,
									button_key,
								)
							}

							if is_double_press {
								if !widget_active_is_state_change &&
								   button_state.widget_active != nil {
									send_message(
										button_state.widget_active,
										.Input_Key,
										&Event_Input_Key_Ctx {
											key = event_ctx.key,
											is_press = true,
											is_repeat = true,
										},
									)
								}
							} else {
								// button press or down
								if !widget_active_is_state_change &&
								   button_state.widget_active != nil {
									send_message(button_state.widget_active, .Input_Key, event_ctx)
								}
							}
							// Technically we already have state drag enter and exit
							// if is_drag_start {
							// } else if is_drag_end {
						}

					case:
						{
							if event_ctx.key == .Esc && event_ctx.is_press {
								// widget_is_any_stil_press := false
								for i in 0 ..< Key_Button_Count {
									button_state := window.button_index_to_state[i]
									// if button_state.widget_press != nil &&
									//    .Lock in button_state.widget_press.flags {
									// 	widget_is_any_stil_press = true
									// } else {
									widget_state_force(
										cast(^Widget_Common)nil,
										.Active,
										button_index_to_key(i),
									)
									// }
									widget_state_force(
										cast(^Widget_Common)nil,
										.Drag,
										button_index_to_key(i),
									)
								}
								/* if !widget_is_any_stil_press do */break
							}

							for i in 0 ..< Key_Button_Count {
								button_state := window.button_index_to_state[i]
								if button_state.widget_active != nil {
									send_message(button_state.widget_active, .Input_Key, event_ctx)
								}
							}
						}
					}
				}

			case .Input_Mouse_Move:
				{
					event_ctx := transmute(^[2]f32)event_ctx

					drag_delta := [2]f32 {
						event_ctx.x - window.mouse_position.x,
						event_ctx.y - window.mouse_position.y,
					}

					window.mouse_position.x = event_ctx.x
					window.mouse_position.y = event_ctx.y

					widget_hover_is_state_change := widget_state_refresh(.Hover)
					//           ^ We can see this code here and there and it's goal is to
					//						 make widgets receive only events in between state change¹:
					// 						 - event state enter²
					// 						 - events in between
					// 						 - event state exit²
					//
					//						 ¹ For example, a button press event that led to a new widget
					//							 in press state won't be received by this widget, but the
					//							 next ones, yes; and it won't even receive the press that
					//							 led to its exit of press state.
					//						 ² You can deduce what event led to a state change event, if needed.

					if !widget_hover_is_state_change && window.widget_hover != nil {
						send_message(window.widget_hover, .Input_Mouse_Move, &event_ctx)
					}
					for i in 0 ..< Key_Button_Count {
						button_state := window.button_index_to_state[i]

						if button_state.widget_drag != nil {
							send_message(
								button_state.widget_drag,
								.Input_Drag,
								&Event_Input_Drag_Ctx {
									delta = drag_delta,
									button = button_index_to_key(i),
								},
							)
						}

						if button_state.widget_down != nil &&
						   (widget_hover_is_state_change ||
								   window.widget_hover != button_state.widget_down) {
							send_message(button_state.widget_down, .Input_Mouse_Move, &event_ctx)
						}
					}
				}
			}

			return 0
		},
	)
	window._context = context // So I can take track of more allocations when I need.
	window.animate_widgets = make([dynamic]^Widget_Common)

	ft.init_free_type(&window.ft)

	assert(glfw.Init() == true)

	glfw.WindowHint(glfw.OPENGL_PROFILE, glfw.OPENGL_CORE_PROFILE)
	glfw.WindowHint(glfw.CONTEXT_VERSION_MAJOR, 4)
	glfw.WindowHint(glfw.CONTEXT_VERSION_MINOR, 3)

	ctitle := strings.clone_to_cstring(title)
	defer delete(ctitle)

	bounds_screen_relative := get_window_initial_bounds(width, height)

	glfw.WindowHint(glfw.POSITION_X, i32(bounds_screen_relative.x))
	glfw.WindowHint(glfw.POSITION_Y, i32(bounds_screen_relative.y))

	glfw.WindowHint(glfw.SCALE_TO_MONITOR, glfw.TRUE)

	window.handle = glfw.CreateWindow(
		i32(bounds_screen_relative.w),
		i32(bounds_screen_relative.z),
		ctitle,
		nil,
		nil,
	)
	window_w, window_h := glfw.GetWindowSize(window.handle)
	window.bounds.w = f32(window_w)
	window.bounds.z = f32(window_h)
	//                    ^ We need to re-get the size because
	//										  for some reason, at least certain 
	//											times, it scales it based dpi.
	//											But it may be possible that MacOS
	//											scales the framebuffer. I have to see.

	window.scale, _ = glfw.GetWindowContentScale(window.handle)
	//            ^ Assuming x and y scales are the same

	window.cursors[.Arrow] = glfw.CreateStandardCursor(glfw.ARROW_CURSOR)
	window.cursors[.Ibeam] = glfw.CreateStandardCursor(glfw.IBEAM_CURSOR)
	window.cursors[.Cross] = glfw.CreateStandardCursor(glfw.CROSSHAIR_CURSOR)
	window.cursors[.Size_NW_SE] = glfw.CreateStandardCursor(glfw.RESIZE_NWSE_CURSOR)
	window.cursors[.Size_NE_SW] = glfw.CreateStandardCursor(glfw.RESIZE_NESW_CURSOR)
	window.cursors[.Size_WE] = glfw.CreateStandardCursor(glfw.RESIZE_EW_CURSOR)
	window.cursors[.Size_NS] = glfw.CreateStandardCursor(glfw.RESIZE_NS_CURSOR)
	window.cursors[.Size_All] = glfw.CreateStandardCursor(glfw.RESIZE_ALL_CURSOR)
	window.cursors[.No] = glfw.CreateStandardCursor(glfw.NOT_ALLOWED_CURSOR)
	window.cursors[.Hand] = glfw.CreateStandardCursor(glfw.POINTING_HAND_CURSOR)

	glfw.MakeContextCurrent(window.handle)

	// glfw.SwapInterval(0)

	gl.load_up_to(4, 3, glfw.gl_set_proc_address)
	// ^ Temporary load everything

	gl.Enable(gl.BLEND)
	gl.BlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	// ^ Yeah?

	glfw.SetWindowRefreshCallback(window.handle, proc "c" (_: glfw.WindowHandle) {
		context = window._context
		widget_mark_refresh_all_in(window)
		window_process_animations()
		window_try_refresh_now()
	})

	glfw.SetWindowSizeCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, width, height: c.int) {
			context = window._context
			new_size := [2]f32{f32(width), f32(height)}
			send_message(window, .Window_Resized, &new_size)
		},
	)

	glfw.SetWindowFocusCallback(window.handle, proc "c" (_: glfw.WindowHandle, focused: c.int) {
		context = window._context
		is_active := focused == 1
		send_message(window, .Window_Active, &is_active)
	})

	glfw.SetWindowCloseCallback(window.handle, proc "c" (_: glfw.WindowHandle) {
		context = window._context
		should_close := send_message(window, .Window_Close) == 0
		glfw.SetWindowShouldClose(window.handle, b32(should_close))
	})

	glfw.SetWindowMaximizeCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, maxified: c.int) {
			context = window._context
			if maxified == 1 {
				width, height := glfw.GetWindowSize(window.handle)
				new_size := [2]f32{f32(width), f32(height)}
				send_message(window, .Window_Maximized, &new_size)
			}
		},
	)

	glfw.SetWindowIconifyCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, iconified: c.int) {
			context = window._context
			if iconified == 1 {
				width, height := glfw.GetWindowSize(window.handle)
				new_size := [2]f32{f32(width), f32(height)}
				send_message(window, .Window_Minimized, &new_size)
			}
		},
	)

	glfw.SetDropCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, count: c.int, paths: [^]cstring) {
			context = window._context
			files := make([]string, count)
			defer delete(files)
			for i in 0 ..< count {
				files[i] = string(paths[i])
			}
			send_message(window, .Input_Files, &files)
		},
	)

	glfw.SetWindowContentScaleCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, xscale, yscale: f32) {
			context = window._context
			old_scale := window.scale
			window.scale = xscale
			//             ^ Assuming x and y scales are the same
			send_message(window, .Window_Scale_Change, &old_scale)
		},
	)

	glfw.SetKeyCallback(window.handle, proc "c" (_: glfw.WindowHandle, key, scancode, action, mods: c.int) {
		context = window._context
		window.modifiers = {}
		if mods & glfw.MOD_SHIFT != 0 do window.modifiers += {.Shift}
		if mods & glfw.MOD_CONTROL != 0 do window.modifiers += {.Control}
		if mods & glfw.MOD_ALT != 0 do window.modifiers += {.Alt}
		if mods & glfw.MOD_SUPER != 0 do window.modifiers += {.Super}
		if mods & glfw.MOD_CAPS_LOCK != 0 do window.modifiers += {.Caps_Lock}
		if mods & glfw.MOD_NUM_LOCK != 0 do window.modifiers += {.Num_Lock}

		if key == glfw.KEY_UNKNOWN {
			return
		}

		key := virtual_key_to_key[key]
		if key != .Invalid {
			input_event := Event_Input_Key_Ctx {
				key       = key,
				is_press  = action == glfw.RELEASE,
				is_repeat = action == glfw.REPEAT,
			}
			send_message(window, .Input_Key, &input_event)
		}
	})

	glfw.SetMouseButtonCallback(
		window.handle,
		proc "c" (_: glfw.WindowHandle, button, action, mods: c.int) {
			context = window._context
			input_event := Event_Input_Key_Ctx {
				key       = virtual_key_to_key[button],
				is_press  = action == glfw.RELEASE,
				is_repeat = false,
			}
			send_message(window, .Input_Key, &input_event)
		},
	)

	glfw.SetCursorPosCallback(window.handle, proc "c" (_: glfw.WindowHandle, xpos, ypos: f64) {
		context = window._context
		send_message(window, .Input_Mouse_Move, &[2]f32{f32(xpos), f32(ypos)})
	})

	glfw.SetScrollCallback(window.handle, proc "c" (_: glfw.WindowHandle, xoffset, yoffset: f64) {
		context = window._context
		send_message(window, .Input_Scroll, &[2]f32{f32(xoffset), f32(yoffset)})
	})

	glfw.SetCharCallback(window.handle, proc "c" (_: glfw.WindowHandle, codepoint: rune) {
		context = window._context
		codepoint := codepoint
		send_message(window, .Input_Typed, &codepoint)
	})

	gl.GenTextures(1, &window.offscreen_framebuffer_texture)
	gl.ActiveTexture(gl.TEXTURE0)
	gl.BindTexture(gl.TEXTURE_2D, window.offscreen_framebuffer_texture)

	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)

	gl.TexImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA32F,
		i32(window.bounds.w),
		i32(window.bounds.z),
		0,
		gl.RGBA,
		gl.FLOAT,
		nil,
	)

	gl.GenFramebuffers(1, &window.offscreen_framebuffer)
	gl.BindFramebuffer(gl.FRAMEBUFFER, window.offscreen_framebuffer)
	gl.FramebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		window.offscreen_framebuffer_texture,
		0,
	)

	return window
}

window_set_cursor :: proc(cursor: Cursor) {
	glfw.SetCursor(window.handle, window.cursors[cursor])
}

virtual_key_to_key := [0xffff]Key { 	// < Two bytes should be enought to cover all virtual
	//																		   keys, except for, for example, glfw.KEY_UNKNOWN -1 value.
	//																		   What's not set below, of course, is automatically
	//																		   bound to .Invalid.
	glfw.MOUSE_BUTTON_1    = .Left_Button,
	glfw.MOUSE_BUTTON_2    = .Right_Button,
	glfw.MOUSE_BUTTON_3    = .Middle_Button,
	glfw.MOUSE_BUTTON_4    = .X1_Button,
	glfw.MOUSE_BUTTON_5    = .X2_Button,
	glfw.KEY_A             = .A,
	glfw.KEY_B             = .B,
	glfw.KEY_C             = .C,
	glfw.KEY_D             = .D,
	glfw.KEY_E             = .E,
	glfw.KEY_F             = .F,
	glfw.KEY_G             = .G,
	glfw.KEY_H             = .H,
	glfw.KEY_I             = .I,
	glfw.KEY_J             = .J,
	glfw.KEY_K             = .K,
	glfw.KEY_L             = .L,
	glfw.KEY_M             = .M,
	glfw.KEY_N             = .N,
	glfw.KEY_O             = .O,
	glfw.KEY_P             = .P,
	glfw.KEY_Q             = .Q,
	glfw.KEY_R             = .R,
	glfw.KEY_S             = .S,
	glfw.KEY_T             = .T,
	glfw.KEY_U             = .U,
	glfw.KEY_V             = .V,
	glfw.KEY_W             = .W,
	glfw.KEY_X             = .X,
	glfw.KEY_Y             = .Y,
	glfw.KEY_Z             = .Z,
	glfw.KEY_0             = .Zero,
	glfw.KEY_1             = .One,
	glfw.KEY_2             = .Two,
	glfw.KEY_3             = .Three,
	glfw.KEY_4             = .Four,
	glfw.KEY_5             = .Five,
	glfw.KEY_6             = .Six,
	glfw.KEY_7             = .Seven,
	glfw.KEY_8             = .Eight,
	glfw.KEY_9             = .Nine,
	glfw.KEY_KP_0          = .Zero,
	glfw.KEY_KP_1          = .One,
	glfw.KEY_KP_2          = .Two,
	glfw.KEY_KP_3          = .Three,
	glfw.KEY_KP_4          = .Four,
	glfw.KEY_KP_5          = .Five,
	glfw.KEY_KP_6          = .Six,
	glfw.KEY_KP_7          = .Seven,
	glfw.KEY_KP_8          = .Eight,
	glfw.KEY_KP_9          = .Nine,
	glfw.KEY_F1            = .F1,
	glfw.KEY_F2            = .F2,
	glfw.KEY_F3            = .F3,
	glfw.KEY_F4            = .F4,
	glfw.KEY_F5            = .F5,
	glfw.KEY_F6            = .F6,
	glfw.KEY_F7            = .F7,
	glfw.KEY_F8            = .F8,
	glfw.KEY_F9            = .F9,
	glfw.KEY_F10           = .F10,
	glfw.KEY_F11           = .F11,
	glfw.KEY_F12           = .F12,
	glfw.KEY_SPACE         = .Space,
	glfw.KEY_GRAVE_ACCENT  = .Tick,
	glfw.KEY_MINUS         = .Minus,
	glfw.KEY_EQUAL         = .Equal,
	glfw.KEY_LEFT_BRACKET  = .Left_Bracket,
	glfw.KEY_RIGHT_BRACKET = .Right_Bracket,
	glfw.KEY_SEMICOLON     = .Semicolon,
	glfw.KEY_APOSTROPHE    = .Quote,
	glfw.KEY_COMMA         = .Comma,
	glfw.KEY_PERIOD        = .Period,
	glfw.KEY_SLASH         = .Slash,
	glfw.KEY_BACKSLASH     = .Backslash,
	glfw.KEY_TAB           = .Tab,
	glfw.KEY_PAUSE         = .Pause,
	glfw.KEY_ESCAPE        = .Esc,
	glfw.KEY_UP            = .Up,
	glfw.KEY_LEFT          = .Left,
	glfw.KEY_DOWN          = .Down,
	glfw.KEY_RIGHT         = .Right,
	glfw.KEY_BACKSPACE     = .Backspace,
	glfw.KEY_ENTER         = .Return,
	glfw.KEY_DELETE        = .Delete,
	glfw.KEY_INSERT        = .Insert,
	glfw.KEY_PAGE_UP       = .Page_Up,
	glfw.KEY_PAGE_DOWN     = .Page_Down,
	glfw.KEY_HOME          = .Home,
	glfw.KEY_END           = .End,
	glfw.KEY_CAPS_LOCK     = .Caps_Lock,
	glfw.KEY_NUM_LOCK      = .Num_Lock,
	glfw.KEY_SCROLL_LOCK   = .Scroll_Lock,
	glfw.KEY_MENU          = .Menu,
	glfw.KEY_LEFT_CONTROL  = .Ctrl,
	glfw.KEY_RIGHT_CONTROL = .Ctrl,
	glfw.KEY_LEFT_SHIFT    = .Shift,
	glfw.KEY_RIGHT_SHIFT   = .Shift,
	glfw.KEY_LEFT_ALT      = .Alt,
	glfw.KEY_RIGHT_ALT     = .Alt,
	glfw.KEY_LEFT_SUPER    = .Super,
	glfw.KEY_RIGHT_SUPER   = .Super,
	glfw.KEY_KP_DIVIDE     = .Num_Slash,
	glfw.KEY_KP_MULTIPLY   = .Num_Star,
	glfw.KEY_KP_SUBTRACT   = .Num_Minus,
	glfw.KEY_KP_ADD        = .Num_Plus,
	glfw.KEY_KP_DECIMAL    = .Num_Period,
}

Glyph :: struct {
	buffer:        [^]f32, // 0xRRGGBB
	offset:        [2]f32,
	width, height: f32,
	advance_x:     f32,
}

Font :: struct {
	file_path:             string,
	size:                  f32,
	ft_face:               ft.Face,
	rendered_glyphs:       map[rune]Glyph,
	line_height:           f32,
	offset_y_for_baseline: f32,
}

font_create_raw :: proc(file_path: string, size: f32) -> (font: ^Font) {
	assert(window != nil)

	font = new(Font)

	font.file_path = file_path
	cfile_path := strings.clone_to_cstring(font.file_path)
	defer delete(cfile_path)
	assert(ft.new_face(window.ft, cfile_path, 0, &font.ft_face) == .Ok, file_path)

	font.size = window_scale_discrete_up(size)
	ft.set_char_size(font.ft_face, 0, ft.F26Dot6(font.size * 64), 96, 96)

	font.rendered_glyphs = make(map[rune]Glyph)

	font.line_height = f32(font.ft_face.size.metrics.height >> 6)
	font.offset_y_for_baseline = f32(font.ft_face.size.metrics.ascender >> 6)
	return
}

font_create :: proc(file_path: string, size: f32) -> (index: int) {
	font := font_create_raw(file_path, size)

	assert(window.font_created_count < len(window.font_created))
	index = window.font_created_count

	window.font_created[window.font_created_count] = font

	window.font_created_count += 1
	return
}

font_free :: proc(font: ^Font) {
	ft.done_face(font.ft_face)
	for _, g in font.rendered_glyphs {
		mem.free(g.buffer)
	}
	delete(font.rendered_glyphs)
	free(font)
}

font_at_index :: proc(index: int) -> ^Font #no_bounds_check {
	assert(window.font_created_count > 0 && 0 <= index && index < window.font_created_count)
	return window.font_created[index]
}

font_stack_last_index :: proc() -> int #no_bounds_check {
	assert(window.font_stack_count > 0)
	return window.font_stack[window.font_stack_count - 1]
}

font_stack_last :: proc() -> ^Font #no_bounds_check {
	assert(window.font_created_count > 0 && window.font_stack_count > 0)
	return window.font_created[window.font_stack[window.font_stack_count - 1]]
}

font_stack_push :: proc(index: int) #no_bounds_check {
	assert(window.font_stack_count < len(window.font_stack))
	window.font_stack[window.font_stack_count] = index
	window.font_stack_count += 1
}

font_stack_pop :: proc() -> int #no_bounds_check {
	assert(window.font_stack_count > 0)
	window.font_stack_count -= 1
	return window.font_stack[window.font_stack_count]
}

widget_mark_relayout :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	widget.flags += {.Relayout}
	window.flags += {.Relayout}
}

widget_mark_repaint :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	if window.repaint_region == {} {
		assert(
			(window.bounds == {} && widget.bounds == {}) ||
			rect_is_intersect(window.bounds, widget.bounds),
		)
		window.repaint_region = widget.bounds
	} else {
		window.repaint_region = rect_bounding(window.repaint_region, widget.bounds)
	}
	visible_area := rect_intersect(window.bounds, window.repaint_region, assert_intersect = false)
	window.repaint_region = visible_area
}

widget_mark_refresh :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	widget_mark_relayout(widget)
	widget_mark_repaint(widget)
}

window_try_relayout_now :: proc() {
	if .Relayout in window.flags {
		window.flags -= {.Relayout}
		send_message(window, .Widget_Layout)
		// window.flags -= {.Relayout}
	}
}

window_try_repaint_now :: proc(end_paint := true) {
	if rect_not_zero(window.repaint_region) {
		gl.BindFramebuffer(gl.FRAMEBUFFER, window.offscreen_framebuffer)
		{
			send_message(window, .Widget_Paint)
		}

		if end_paint do gl.BindFramebuffer(gl.FRAMEBUFFER, WINDOW_DEFAULT_FRAMEBUFFER)
		{
			@(static) shader_program: u32
			@(static) vs_source, fs_source :=
				#load("window_post_processing.vs", string),
				#load("window_post_processing.fs", string)

			@(static) uniform_offscreen_framebuffer_texture: i32

			if shader_program == 0 {
				shader_program, _ = gl.load_shaders_source(vs_source, fs_source)
				uniform_offscreen_framebuffer_texture = gl.GetUniformLocation(
					shader_program,
					"offscreen_framebuffer_texture",
				)
			}

			gl.UseProgram(shader_program)

			gl.Uniform1i(uniform_offscreen_framebuffer_texture, OFFSCREEN_FRAMEBUFFER_TEXTURE)

			gl.DrawArrays(gl.TRIANGLE_STRIP, 0, 4)

			glfw.SwapBuffers(window.handle)
		}

		window.repaint_region = {}
	}
}

window_try_refresh_now :: proc() {
	window_try_relayout_now()
	window_try_repaint_now()
}

widget_mark_relayout_all_in :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	// Wait, here we're marking for relayout parent widget too.
	// Is this fine?
	walk_widget(widget)
	walk_widget :: proc(widget: ^Widget_Common) {
		widget.flags += {.Relayout}
		for child in widget.children {
			walk_widget(child)
		}
	}
	window.flags += {.Relayout}
}

widget_mark_repaint_all_in :: widget_mark_repaint // Of course, given the priciple that parent's bounds contains child's bounds.
//																									 But at the same, we are marking for repaint the entire parent widget too here.
//																									 As for widget_mark_relayout_all_in, is this fine?

// Of course there is a problem raised by the two procedures used.
widget_mark_refresh_all_in :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	widget_mark_repaint_all_in(widget)
	widget_mark_relayout_all_in(widget)
}

widget_refresh_all_up_now :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	/* 
		sia se l'elemento si è fatto più piccolo e sia se si è mosso e fare un bounding del prima e dopo per il repaint
se nessuna delle due cose accade, siamo arrivati alla fine e bisogna fare un repaint del bounds

 */
	// In più attenzione perché una va in reverse e uno va in order, bisogna ricordare il motivo
	// al fine di capire se c'è bisogno

	// ho fatto delle analisi e forse non ci conviene fare lo stop per la complessità necessaria,
	// invece facciamo fino ad up completo

	// walk_widget_relayout_0(window)
	// walk_widget_relayout_0 :: proc(
	// 	widget: ^$Widget,
	// ) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	// 	intrinsics.type_has_field(Widget, "common") {
	// 	#reverse for child in widget.children {
	// 		walk_widget_relayout_0(child)
	// 	}

	// 	if .Relayout in widget.flags {
	// 		send_message(widget, .Widget_Layout_0)
	// 	}
	// }

	// walk_widget_relayout_1(window)
	// walk_widget_relayout_1 :: proc(
	// 	widget: ^$Widget,
	// ) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	// 	intrinsics.type_has_field(Widget, "common") {
	// 	if .Relayout in widget.flags {
	// 		send_message(widget, .Widget_Layout_1)
	// 		widget.flags -= {.Relayout}
	// 	}

	// 	for child in widget.children {
	// 		walk_widget_relayout_1(child)
	// 	}
	// }
}

widget_animate :: proc(
	widget: ^$Widget,
	stop := false,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	index := -1
	for w, i in window.animate_widgets {
		if w == widget {
			index = i
			break
		}
	}

	if stop {
		unordered_remove(&window.animate_widgets, index)
		return
	}

	if index == -1 {
		append(&window.animate_widgets, widget)
	}
}

Floating_Ctx :: struct {
	anchor:          ^Widget_Common,
	default_handler: Handler,
}

// 1. Use nil anchor to remove floating, but use widget_floating_detach() first.
// 2. This makes use of Widget_Common's extra_space. 
// 3. Use only once per widget, unless you follow step 1 first.
widget_make_floating :: proc(
	widget: ^$Widget_0,
	anchor: ^$Widget_1,
) where intrinsics.type_elem_type(Widget_0) == Widget_Common ||
	intrinsics.type_has_field(Widget_0, "common"),
	intrinsics.type_elem_type(Widget_1) == Widget_Common ||
	intrinsics.type_has_field(Widget_1, "common") {
	assert(widget != nil)
	if anchor == nil {
		ctx := transmute(^Floating_Ctx)widget.extra_space

		widget.handler = ctx.default_handler

		free(ctx)
		widget.extra_space = 0
	} else {
		widget.extra_space = transmute(int)new(Floating_Ctx)
		ctx := transmute(^Floating_Ctx)widget.extra_space

		ctx.anchor = anchor
		ctx.default_handler = widget.handler

		widget.handler = proc(widget: rawptr, message: Message, event_ctx: rawptr) -> int {
			widget := transmute(^Widget_Common)widget
			ctx := transmute(^Floating_Ctx)widget.extra_space

			if message == .Widget_Layout_1 {
				widget.bounds.x = ctx.anchor.bounds.x + ctx.anchor.bounds.w - widget.bounds.w
				widget.bounds.y = ctx.anchor.bounds.y + ctx.anchor.bounds.z
			}

			result := ctx.default_handler(widget, message, event_ctx)

			if message == .Widget_Layout_1 {
				widget_mark_repaint(widget)
			}

			return result
		}
	}
}

widget_tree_attach :: proc(
	tree: ^$Widget_0,
	leaf: ^$Widget_1,
) where intrinsics.type_elem_type(Widget_0) == Widget_Common ||
	intrinsics.type_has_field(Widget_0, "common"),
	intrinsics.type_elem_type(Widget_1) == Widget_Common ||
	intrinsics.type_has_field(Widget_1, "common") {
	found := false
	for &w in tree.children {
		if w == leaf do found = true
	}

	if !found {
		leaf.parent = tree
		append(&leaf.parent.children, leaf)

		// Here we may also not need relayout sometimes, 
		// so more paths are born, and so complexity arises,
		// but I fuse the paths together, removing complexity.
		widget_mark_relayout_all_in(leaf)
	}
}

widget_tree_detach :: proc(
	leaf: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	index := -1
	for &w, i in leaf.parent.children {
		if w == leaf {
			index = i
			break
		}
	}
	assert(index != -1)

	ordered_remove(&leaf.parent.children, index)
	leaf.parent = nil

	widget_mark_repaint(leaf)
}

message_loop :: proc() {
	for glfw.WindowShouldClose(window.handle) == false {
		start_time: time.Time = ---

		if len(window.animate_widgets) > 0 {
			start_time = time.now()
			glfw.PollEvents()
			window_process_animations()
		} else {
			glfw.WaitEvents()
			start_time = time.now()
		}
		window_try_refresh_now()

		window.frame_time = time.since(start_time)
		// fmt.println("frame_time", window.frame_time)
	}
}

window_process_animations :: proc() {
	for widget in window.animate_widgets {
		send_message(widget, .Widget_Animate)
	}
}

// Rename send_message -> dispatch_event AND Message -> Event
send_message :: proc(
	widget: ^$Widget,
	message: Message,
	event: rawptr = nil,
) -> int where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	// if widget.id != 0 {
	// 	#partial switch message {
	// 	case .Widget_State_Down, .Widget_State_Press, .Widget_State_Drag, .Widget_State_Hover:
	// 		{
	// 			event_ctx := transmute(^Event_Widget_State_Ctx)event
	// 			fmt.print("state", message, "")
	// 			if message != .Widget_State_Hover {
	// 				fmt.print("button", event_ctx.button, "")
	// 			}
	// 			if event_ctx.enter {
	// 				fmt.print("enter")
	// 			} else {
	// 				fmt.print("exit")
	// 			}
	// 			fmt.println(" widget_id", widget.id)
	// 		}

	// 	case .Widget_Paint, .Widget_Animate, .Widget_Layout, .Input_Mouse_Move:
	// 		{

	// 		}

	// 	case .Input_Key:
	// 		{
	// 			event := transmute(^Event_Input_Key_Ctx)event

	// 			if event.key == .Left_Button ||
	// 			   event.key == .Right_Button ||
	// 			   event.key == .Middle_Button ||
	// 			   event.key == .X1_Button ||
	// 			   event.key == .X2_Button {
	// 				fmt.println(
	// 					"event",
	// 					message,
	// 					"button",
	// 					event.key,
	// 					"doublepress" if event.is_press && event.is_repeat else "press" if event.is_press else "down",
	// 					"widget_id",
	// 					widget.id,
	// 				)
	// 				break
	// 			}

	// 			fallthrough
	// 		}

	// 	case:
	// 		{
	// 			fmt.print("event", message, "widget_id", widget.id)
	// 			if message == .Input_Mouse_Move {
	// 				fmt.print("", window.mouse_position)
	// 			}
	// 			fmt.println()
	// 		}
	// 	}
	// }

	// if message == .Widget_Paint {
	// 	fmt.println("paint", widget.id)
	// }

	// if message != .Input_Mouse_Move {
	// 	fmt.println(message, widget.id)
	// }

	return widget.handler(widget, message, event)
}

id := 0
widget_make_common :: proc(
	$Widget: typeid,
	bounds: [4]f32 = {},
	handler: Handler = nil,
	parent: rawptr = nil,
	flags: Widget_Flags = {},
	extra_space: int = 0,
) -> ^Widget where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	widget := new(Widget)
	widget.bounds = bounds
	widget.handler = handler
	when intrinsics.type_elem_type(Widget) != Window {
		if parent != nil {
			widget.parent = transmute(^Widget_Common)parent
		} else if window.parent_stack_count > 0 {
			widget.parent = window.parent_stack[window.parent_stack_count - 1]
		}

		if widget.parent != nil {
			append(&widget.parent.children, transmute(^Widget_Common)widget)
		}
	}
	widget.children = make([dynamic]^Widget_Common)
	widget.flags = flags
	widget.extra_space = extra_space
	widget.id = id
	id += 1
	return widget
}

// Messages are not meant to be sent with send_message by the user.
//
// Event's context is assumed to be read-only and non-persistent.
Message :: enum {
	// Window
	Window_Minimized, // 			event_ctx: ^[2]f32 											Where [0] = width and [1] = height.
	Window_Maximized, // 			event_ctx: ^[2]f32 											Where [0] = width and [1] = height.
	Window_Resized, // 				event_ctx: ^[2]f32 											Where [0] = width and [1] = height.
	Window_Active, //					event_ctx: ^bool												Is active.
	Window_Close, // 																									Return non-zero to prevent default.
	Window_Scale_Change, // 	event_ctx: ^f32													Old scale. New scale is already set by platform-specific code.

	// Input
	Input_Key, // 						event_ctx: ^Event_Input_Key_Ctx
	Input_Typed, // 					event_ctx: ^rune
	Input_Mouse_Move, // 			event_ctx: ^[2]f32											Where [0] = x and [1] = y.
	Input_Scroll, // 					event_ctx: ^[2]f32 											Where [0] = x and [1] = y.
	Input_Drag, // 						event_ctx: ^Event_Input_Drag_Ctx
	Input_Files, // 					event_ctx: ^[]string 										You have to free the slice and the individual strings.

	// Widget
	Widget_Layout, //																									Window will worry about sending layout messages (both in the same frame).
	Widget_Layout_0 = Widget_Layout, //																Sent in reverse order.
	Widget_Layout_1, //																								Sent in order.
	Widget_Paint, // 					event_ctx: ^[4]f32											Clip (between widget, window and repaint region). Window will 
	//																																worry about sending paint messages.
	Widget_Animate,
	Widget_State_Hover, //		event_ctx: ^Event_Widget_State_Ctx			Enables receiving .Input_Mouse_Move, .Input_Scroll.
	Widget_State_Down, //			event_ctx: ^Event_Widget_State_Ctx			Enables receiving .Input_Mouse_Move.
	Widget_State_Press, //		event_ctx: ^Event_Widget_State_Ctx
	Widget_State_Drag, //			event_ctx: ^Event_Widget_State_Ctx			Enables receiving .Input_Drag.
	Widget_State_Active, //		event_ctx: ^Event_Widget_State_Ctx			Enables receiving .Input_Key, .Input_Typed.
	Widget_Disabled, //				event_ctx: ^bool
}

Event_Widget_State_Ctx :: struct {
	enter:  bool, // 				If false then it's exit. For .Widget_State_Press it doesn't matter and it's always true.
	button: Key, //					.Invalid for hover state of course.
	forced: bool, // 				State change caused by widget_state_force¹, which may also mean escape key was pressed or holded.
	//
	//											¹ The state change can also be a side effect, for example if you force enter press state for a widget,
	//											the current, if any, will exit press state.
}

Handler :: #type proc(widget: rawptr, message: Message, event_ctx: rawptr) -> int

// A widget does three things:
//	- input processing
//	- have data
//	- display data
// Every widget crafted here has its handler
// in its create procedure.
Widget_Common :: struct {
	bounds:      [4]f32, // 								We assume parent's bounds contains child's bounds¹.
	//
	//																			¹ So, for example, window will not detect press of 
	// 																				an overflowing child², that's why you have to
	//																				adjust the view.
	//																			² I guess you may encounter overflow by scroll or by 
	//																				minimal size constraint. For example, a 20px wide 
	//																				panel contains a 60px wide button, because button's 
	//																				width depends on its own content. 
	//																				In these cases it's fundamental to crop to intersection 
	//																				during layout too, and not only during paint, otherwise 
	//																				you'll have for example ghost hover/press. I mean, this 
	//																				is what window already does with widgets.
	handler:     Handler, // 								Probably the most useful object to comprehend widget's behavior.
	parent:      ^Widget_Common,
	children:    [dynamic]^Widget_Common,
	flags:       Widget_Flags,
	extra_space: int,
	id:          int,
}

Widget_Flags :: bit_set[Widget_Flag]

window: ^Window

Key_Button_Count :: 5
Key_Button_Start :: Key.Left_Button
Key :: enum {
	Invalid,
	Left_Button,
	Right_Button,
	Middle_Button,
	X1_Button,
	X2_Button,
	A,
	B,
	C,
	D,
	E,
	F,
	G,
	H,
	I,
	J,
	K,
	L,
	M,
	N,
	O,
	P,
	Q,
	R,
	S,
	T,
	U,
	V,
	W,
	X,
	Y,
	Z,
	Zero,
	One,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine,
	F1,
	F2,
	F3,
	F4,
	F5,
	F6,
	F7,
	F8,
	F9,
	F10,
	F11,
	F12,
	Space,
	Tick,
	Minus,
	Equal,
	Left_Bracket,
	Right_Bracket,
	Semicolon,
	Quote,
	Comma,
	Period,
	Slash,
	Backslash,
	Tab,
	Pause,
	Esc,
	Up,
	Left,
	Down,
	Right,
	Backspace,
	Return,
	Delete,
	Insert,
	Page_Up,
	Page_Down,
	Home,
	End,
	Caps_Lock,
	Num_Lock,
	Scroll_Lock,
	Menu,
	Ctrl,
	Shift,
	Alt,
	Super,
	Num_Slash,
	Num_Star,
	Num_Minus,
	Num_Plus,
	Num_Period,
}

Key_State :: enum {
	Down,
	Press,
	Repeat, // Which is double press in case of a mouse button.
}

Event_Input_Key_Ctx :: struct {
	key:       Key,
	is_press:  bool,
	is_repeat: bool,
	/* 
	^ These two can be converted in an enum {Down, Press, Repeat, PressRepeat/DoublePress}
	  or better a bitset.
	 */
}

Event_Input_Drag_Ctx :: struct {
	delta:  [2]f32,
	button: Key, // Perhaps it's useless and just creates the possibility of receiving duplicated drag events
}

Cursor :: enum {
	Arrow,
	Ibeam,
	Cross,
	Size_NW_SE,
	Size_NE_SW,
	Size_WE,
	Size_NS,
	Size_All,
	No,
	Hand,
}

get_window_initial_bounds :: proc(w, h: int) -> (bounds: [4]f32) {
	monitor := glfw.GetPrimaryMonitor()
	monitor_x, monitor_y, monitor_w, monitor_h := glfw.GetMonitorWorkarea(monitor)
	monitor_scale, _ := glfw.GetMonitorContentScale(monitor)
	monitor_xf := f32(monitor_x)
	monitor_yf := f32(monitor_y)
	monitor_wf := f32(monitor_w)
	monitor_hf := f32(monitor_h)
	window_wf := f32(w)
	window_hf := f32(h)

	factor := 2 * 2 * 2 * math.log2_f32(min(monitor_wf, monitor_hf))
	bounds.w = math.floor((factor * 16 if w == -1 else window_wf) / monitor_scale)
	bounds.z = math.floor((factor * 9 if h == -1 else window_hf) / monitor_scale)

	bounds.x = math.floor((monitor_xf + monitor_wf * 0.13) / monitor_scale)
	bounds.y = math.floor((monitor_yf + monitor_hf * 0.17) / monitor_scale)

	//         ^ I'm flooring because these will be the initial window values
	//					 and they are set as integers.
	return
}

animate :: proc(
	start_time: ^time.Time,
	duration: time.Duration,
) -> (
	progress: f32,
	finished: bool,
) #optional_ok {
	now := time.now()
	if start_time._nsec == 0 do start_time^ = now

	elapsed := time.diff(start_time^, now)
	progress = f32(f64(elapsed) / f64(duration))
	if progress > 1 {
		start_time._nsec = 0
		finished = true
	}
	return
}

animate_reset_time :: proc(start_time: ^time.Time) {
	start_time._nsec = 0
}

// animate_progress :: proc(start_time: ^time.Time, duration: time.Duration) -> f64 {
// 	now := time.now()
// 	elapsed := time.diff(start_time^, now)
// 	return f64(elapsed) / f64(duration)
// }

// animate_reverse_time_if_animating :: proc(start_time: ^time.Time, duration: time.Duration) {
// 	if start_time._nsec > 0 {
// 		progress := interp_linear(animate(start_time, duration))
// 		start_time._nsec = i64(f64(time.now()._nsec) - f64(duration) * (1.0 - f64(progress)))
// 	}
// }

// Example Problem 1: If you use position 100.5 pixels, the end drawing is weird.
// Example Problem 2: If you use scale widget's width to point something, 
//										rect_intersect then misses, maybe on the border by one pixel.
// The fundamental problem is the same as for rect_intersect, which I think I can 
// describe as: we may use floats how much we want, but at the end the pixels are
// very very discrete.
window_scale_discrete_low :: proc(value: f32) -> f32 {
	return math.floor(value * window.scale)
}

window_scale_discrete_up :: proc(value: f32) -> f32 {
	return math.ceil(value * window.scale)
}

parent_push :: proc(
	widget: ^$Widget,
) where intrinsics.type_elem_type(Widget) == Widget_Common ||
	intrinsics.type_has_field(Widget, "common") {
	assert(window.parent_stack_count < size_of(window.parent_stack) && widget != nil)
	window.parent_stack[window.parent_stack_count] = widget
	window.parent_stack_count += 1
}

parent_pop :: proc() -> ^Widget_Common {
	assert(window.parent_stack_count > 0)
	window.parent_stack_count -= 1
	return window.parent_stack[window.parent_stack_count]
}

Widget_Flag :: enum {
	// General
	Invalid,
	Relayout,
	Disabled,
	// Lock/Lock_Tab
	// Lock_Press

	// Panel
	Panel_Fill_Vert,
	Panel_Fill_Horz,
	Panel_Horizontal,

	// States
	//
	// Some depends on others like Hoverable-Downable.
	//
	// They are per-widget
	Hoverable,
	Downable_All_Buttons,
	Downable_Left_Button,
	Downable_Right_Button,
	Downable_Middle_Button,
	Downable_X1_Button,
	Downable_X2_Button,
	Pressable_All_Buttons,
	Pressable_Left_Button,
	Pressable_Right_Button,
	Pressable_Middle_Button,
	Pressable_X1_Button,
	Pressable_X2_Button,
	Draggable_All_Buttons,
	Draggable_Left_Button,
	Draggable_Right_Button,
	Draggable_Middle_Button,
	Draggable_X1_Button,
	Draggable_X2_Button,
	Activable_All_Buttons,
	Activable_Left_Button,
	Activable_Right_Button,
	Activable_Middle_Button,
	Activable_X1_Button,
	Activable_X2_Button,
}

Widget_Panel :: struct {
	using common: Widget_Common,
	gap:          f32,
	color:        [4]f32,
}

Panel_Style :: struct {
	color: [4]f32,
}

panel_style := Panel_Style {
	color = rgbf(0x181818ff),
}

widget_make_panel :: proc(
	color := panel_style.color,
	gap: f32 = 3.0,
	flags: Widget_Flags = {},
	handler := panel_handler,
) -> ^Widget_Panel {
	panel := widget_make_common(Widget_Panel, flags = flags, handler = panel_handler)
	panel.gap = gap
	panel.color = color
	return panel
}

panel_handler :: proc(widget: rawptr, message: Message, event_ctx: rawptr) -> int {
	widget := transmute(^Widget_Panel)widget
	#partial switch message {
	case .Widget_Layout_0:
		{
			content_horz := .Panel_Fill_Horz not_in widget.flags
			content_vert := .Panel_Fill_Vert not_in widget.flags

			widget.bounds.w = 0 if content_horz else widget.parent.bounds.w
			widget.bounds.z = 0 if content_vert else widget.parent.bounds.z

			if len(widget.children) <= 0 || (!content_horz && !content_vert) do break
			gap := window_scale_discrete_up(widget.gap)
			double_gap := gap * 2

			if .Panel_Horizontal in widget.flags {
				child := &widget.children[0].bounds

				if content_horz do widget.bounds.w += child.w + double_gap
				if content_vert do widget.bounds.z += child.z

				for i in 1 ..< len(widget.children) {
					child = &widget.children[i].bounds

					if content_horz do widget.bounds.w += child.w + gap
					if content_vert do widget.bounds.z = max(widget.bounds.z, child.z)
				}

				if content_vert do widget.bounds.z += double_gap
			} else {
				child := &widget.children[0].bounds

				if content_horz do widget.bounds.w += child.w
				if content_vert do widget.bounds.z += child.z + double_gap

				for i in 1 ..< len(widget.children) {
					child = &widget.children[i].bounds

					if content_horz do widget.bounds.w = max(widget.bounds.w, child.w)
					if content_vert do widget.bounds.z += child.z + gap
				}

				if content_horz do widget.bounds.w += double_gap
			}
		}

	case .Widget_Layout_1:
		{
			if len(widget.children) <= 0 do break
			gap := window_scale_discrete_up(widget.gap)

			if .Panel_Horizontal in widget.flags {
				prev_child: ^[4]f32 = ---
				child := &widget.children[0].bounds

				child.x = widget.bounds.x + gap
				child.y = widget.bounds.y + gap

				for i in 1 ..< len(widget.children) {
					prev_child = &widget.children[i - 1].bounds
					child = &widget.children[i].bounds

					child.x = prev_child.x + prev_child.w + gap
					child.y = prev_child.y
				}
			} else {
				prev_child: ^[4]f32 = ---
				child := &widget.children[0].bounds

				child.x = widget.bounds.x + gap
				child.y = widget.bounds.y + gap

				for i in 1 ..< len(widget.children) {
					prev_child = &widget.children[i - 1].bounds
					child = &widget.children[i].bounds

					child.x = prev_child.x
					child.y = prev_child.y + prev_child.z + gap
				}
			}
		}

	case .Widget_Paint:
		{
			clip := (transmute(^[4]f32)event_ctx)^
			draw_rect(widget.bounds, clip, widget.color, widget.color, 0, {}, {}, 1.0)
		}
	}
	return 0
}

Widget_Button :: struct {
	using common:       Widget_Common,
	content:            string,
	invoke:             Invoke,
	bg_a:               [4]f32,
	bg_b:               [4]f32,
	fg_a:               [4]f32,
	fg_b:               [4]f32,
	border_a:           [4]f32,
	border_b:           [4]f32,
	animate_start_time: time.Time,
	animation_progress: f32,
	font_index:         int,
	min_size:           [2]f32,
	content_size:       [2]f32,
}

Invoke :: #type proc(widget: rawptr)

Button_Style :: struct {
	transition_duration:                                     time.Duration,
	bg_idle, bg_hover, bg_down, bg_disabled:                 [4]f32,
	fg, fg_disabled:                                         [4]f32,
	border_idle, border_hover, border_down, border_disabled: [4]f32,
	border_thickness:                                        f32,
	padding_x:                                               f32,
}

button_style := Button_Style {
	transition_duration = time.Millisecond * 50,
	bg_idle             = rgbf(0x262626ff),
	bg_hover            = rgbf(0x525252ff),
	bg_down             = rgbf(0x404040ff),
	bg_disabled         = rgbf(0x2626267f),
	fg                  = rgbf(0xffffffff),
	fg_disabled         = rgbf(0xffffff7f),
	border_idle         = rgbf(0x525252ff),
	border_hover        = rgbf(0x00000000),
	border_down         = rgbf(0x525252ff),
	border_disabled     = rgbf(0x5252527f),
	border_thickness    = 1.0,
	padding_x           = 2.0,
}

widget_make_button :: proc(
	content: string,
	invoke: Invoke,
	min_size := [2]f32{},
	flags := Widget_Flags{.Hoverable, .Downable_Left_Button, .Pressable_Left_Button},
	handler := button_handler,
) -> ^Widget_Button {
	button := widget_make_common(Widget_Button, flags = flags, handler = handler)
	button.border_a = button_style.border_idle
	button.border_b = button.border_a
	button.bg_a = button_style.bg_idle
	button.bg_b = button.bg_a
	button.fg_a = button_style.fg
	button.fg_b = button.fg_a
	button.invoke = invoke
	button.content = content
	button.font_index = font_stack_last_index()
	button.min_size = min_size
	return button
}

button_handler :: proc(widget: rawptr, message: Message, event_ctx: rawptr) -> int {
	widget := transmute(^Widget_Button)widget
	#partial switch message {
	case .Widget_Layout:
		{
			content_size := text_size(widget.content, widget.font_index)
			widget.content_size = content_size
			double_border_thickness := window_scale_discrete_low(button_style.border_thickness) * 2
			widget.bounds.w = content_size.x + double_border_thickness + button_style.padding_x * 2
			widget.bounds.z = content_size.y + double_border_thickness
			widget.bounds.w = max(widget.bounds.w, window_scale_discrete_up(widget.min_size.x))
			widget.bounds.z = max(widget.bounds.z, window_scale_discrete_up(widget.min_size.y))
		}

	case .Widget_Paint:
		{
			clip := (transmute(^[4]f32)event_ctx)^
			border_thickness := window_scale_discrete_low(button_style.border_thickness)
			draw_rect(
				widget.bounds,
				clip,
				widget.bg_a,
				widget.bg_b,
				border_thickness,
				widget.border_a,
				widget.border_b,
				widget.animation_progress,
			)
			text_bounds := rect_offset(
				rect_offset(widget.bounds, {border_thickness, border_thickness}),
				{button_style.padding_x, 0},
			)
			text_bounds.x = text_bounds.x + text_bounds.w / 2 - widget.content_size.x / 2
			text_bounds.y = text_bounds.y + text_bounds.z / 2 - widget.content_size.y / 2
			text_clip := rect_intersect(clip, text_bounds)
			draw_text(
				widget.content,
				widget.fg_a,
				widget.fg_b,
				widget.animation_progress,
				text_bounds,
				text_clip,
				widget.font_index,
			)
		}

	case .Widget_Animate:
		// Assurdo, ecco cos'è il lag nel gameplay: il frame dura troppo e così il tempo 
		// che torni di nuovo alla parte di codice di un'animazione, hai già saltato gran 
		// parte del progresso di quest'ultima. In più, si mette anche la questione che 
		// ci metti tanto per passare da un frame all'altro. Questa situazione è successa 
		// sul portatile, non ho ancora provato l'ottimizzazione con la gpu.
		{
			animation_progress, is_finished := animate(
				&widget.animate_start_time,
				duration = button_style.transition_duration,
			)
			if is_finished {
				widget_animate(widget, stop = true)
				// And widget.bg_t remains >=1.0 which is fundamental
				// because rect shader always interpolates values even
				// if widget is not animating, as in this case, that the
				// animation is finished. So we leave the interpolation
				// factor bg_t to >=1.0.
			}
			widget.animation_progress = animation_progress
			widget_mark_repaint(widget)
		}

	case .Widget_State_Hover:
		{
			if !widget_is_down(widget, .Left_Button) {
				widget.bg_a = mix(widget.bg_a, widget.bg_b, widget.animation_progress)
				widget_state := transmute(^Event_Widget_State_Ctx)event_ctx
				if widget_state.enter {
					widget.bg_b = button_style.bg_hover
				} else {
					widget.bg_b = button_style.bg_idle
				}
				widget.border_a = mix(widget.border_a, widget.border_b, widget.animation_progress)
				if widget_state.enter {
					widget.border_b = button_style.border_hover
				} else {
					widget.border_b = button_style.border_idle
				}
				animate_reset_time(&widget.animate_start_time)
				widget_animate(widget)
			}
		}

	case .Widget_State_Down:
		{
			widget_state := transmute(^Event_Widget_State_Ctx)event_ctx
			widget.bg_a = mix(widget.bg_a, widget.bg_b, widget.animation_progress)
			if widget_state.enter {
				widget.bg_b = button_style.bg_down
			} else if widget_is_hover(widget) {
				widget.bg_b = button_style.bg_hover
			} else {
				widget.bg_b = button_style.bg_idle
			}
			widget.border_a = mix(widget.border_a, widget.border_b, widget.animation_progress)
			if widget_state.enter {
				widget.border_b = button_style.border_down
			} else if widget_is_hover(widget) {
				widget.border_b = button_style.border_hover
			} else {
				widget.border_b = button_style.border_idle
			}
			animate_reset_time(&widget.animate_start_time)
			widget_animate(widget)
		}

	case .Widget_Disabled:
		{
			is_disabled := (transmute(^bool)event_ctx)^
			widget.border_a = mix(widget.border_a, widget.border_b, widget.animation_progress)
			widget.bg_a = mix(widget.bg_a, widget.bg_b, widget.animation_progress)
			widget.fg_a = mix(widget.fg_a, widget.fg_b, widget.animation_progress)
			if is_disabled {
				widget.border_b = button_style.border_disabled
				widget.bg_b = button_style.bg_disabled
				widget.fg_b = button_style.fg_disabled
			} else {
				widget.border_b = button_style.border_idle
				widget.bg_b = button_style.bg_idle
				widget.fg_b = button_style.fg
			}
			animate_reset_time(&widget.animate_start_time)
			widget_animate(widget)
		}

	case .Widget_State_Press:
		{
			widget_state := transmute(^Event_Widget_State_Ctx)event_ctx
			widget.invoke(widget)
		}
	}
	return 0
}

interp_linear :: proc(t: f32, low: f32 = 0, high: f32 = 1) -> f32 {
	if t < low do return low
	if t >= high do return high
	return t
}

interp_square :: proc(t: f32, low: f32 = 0, high: f32 = 1) -> f32 {
	if t < low do return low
	if t >= high do return high
	return t * t
}

interp_sinstep :: proc(t: f32) -> f32 {
	if t < 0.0 do return 0.0
	if t >= 1.0 do return 1.0
	return (math.sin(math.PI * t - math.PI * 0.5) + 1) * 0.5
}

interp_sinpulse :: proc(t: f32) -> f32 {
	if t < 0.0 do return 0.0
	if t >= 1.0 do return 0.0
	return math.sin(math.PI * t)
}

interp_smoothstep :: proc(t: f32) -> f32 {
	if t < 0.0 do return 0.0
	if t >= 1.0 do return 0.0
	return 3 * t * t - 2 * t * t * t
}

// color 0xrrggbbaa
rgbf :: proc(color: u32) -> [4]f32 {
	r := f32(color >> (3 * 8) & 0xff) / 255.0
	g := f32(color >> (2 * 8) & 0xff) / 255.0
	b := f32(color >> (1 * 8) & 0xff) / 255.0
	a := f32(color >> (0 * 8) & 0xff) / 255.0
	return pixel_gamma_inverse({r, g, b, a})
}

// Saturation and lightness must be in 0..=1 range, while hue must be in 0..=360 range.
hsl :: proc(hue, saturation, lightness: f32, alpha: f32 = 1.0) -> (color: [4]f32) {
	hue := hue
	hue /= 360.0
	hue_1 := hue * 6.0

	c := (1.0 - math.abs(2.0 * lightness - 1.0)) * saturation
	x := c * (1.0 - math.abs(math.mod_f32(hue_1, 2.0) - 1.0))
	m := lightness - c / 2.0

	if hue_1 < 1.0 {
		color.r = c
		color.g = x
		color.b = 0.0
	} else if hue_1 < 2.0 {
		color.r = x
		color.g = c
		color.b = 0.0
	} else if hue_1 < 3.0 {
		color.r = 0.0
		color.g = c
		color.b = x
	} else if hue_1 < 4.0 {
		color.r = 0.0
		color.g = x
		color.b = c
	} else if hue_1 < 5.0 {
		color.r = x
		color.g = 0.0
		color.b = c
	} else {
		color.r = c
		color.g = 0.0
		color.b = x
	}
	color.a = alpha

	color.r = color.r + m
	color.g = color.g + m
	color.b = color.b + m

	return pixel_gamma_inverse(color)
}

gamma :: 1.8

channel_gamma :: proc(channel: f32) -> f32 {
	return math.pow_f32(channel, 1 / gamma)
}

channel_gamma_inverse :: proc(channel: f32) -> f32 {
	return math.pow_f32(channel, gamma)
}

channel_blend_alpha :: proc(src, dst, alpha: f32) -> f32 {
	return alpha * src + (1.0 - alpha) * dst
}

channel_blend_lerp :: proc(src, dst, alpha: f32) -> f32 {
	return dst + (src - dst) * alpha
}

pixel_gamma :: proc(pixel: [4]f32) -> [4]f32 {
	return {
		channel_gamma(pixel.r),
		channel_gamma(pixel.g),
		channel_gamma(pixel.b),
		channel_gamma(pixel.a),
	}
}

pixel_gamma_inverse :: proc(pixel: [4]f32) -> [4]f32 {
	return {
		channel_gamma_inverse(pixel.r),
		channel_gamma_inverse(pixel.g),
		channel_gamma_inverse(pixel.b),
		channel_gamma_inverse(pixel.a),
	}
}

pixel_blend_alpha :: proc(src, dst, alpha: [4]f32) -> [4]f32 {
	return {
		channel_blend_alpha(src.r, dst.r, alpha.r),
		channel_blend_alpha(src.g, dst.g, alpha.g),
		channel_blend_alpha(src.b, dst.b, alpha.b),
		channel_blend_alpha(src.a, dst.a, alpha.a),
	}
}

pixel_blend_lerp :: proc(src, dst, alpha: [4]f32) -> [4]f32 {
	return {
		channel_blend_lerp(src.r, dst.r, alpha.r),
		channel_blend_lerp(src.g, dst.g, alpha.g),
		channel_blend_lerp(src.b, dst.b, alpha.b),
		channel_blend_lerp(src.a, dst.a, alpha.a),
	}
}

mix :: proc(a, b: [$N]f32, x: f32) -> [N]f32 {
	return a + (b - a) * x
}

// Potrei accumulare le informazioni per ogni draw_*(), in questo caso accumulando 
// il vertex buffer e aggiungendogli animation_progress come attributo dato che cambia
// per ogni due triangoli. Poi in end_draw_rect(), settare le uniforms, aggiornare
// vao e vbo e chiamare una volta solamente la draw call.
draw_rect :: proc(
	a: [4]f32,
	clip: [4]f32,
	color_a, color_b: [4]f32,
	border_thickness: f32,
	border_color_a, border_color_b: [4]f32,
	animation_progress: f32,
	caller := #caller_location,
) {
	border_a := rect_to_bottom_left(rect_intersect(clip, a))
	a := rect_to_bottom_left(
		rect_intersect(clip, rect_offset(a, {border_thickness, border_thickness})),
	)
	// OpenGL scissor or rect_intersect? Anyway, both code is already here.
	// border_a := rect_to_bottom_left(a)
	// a := rect_to_bottom_left(rect_offset(a, {border_thickness, border_thickness}))

	// clip_bl := rect_to_bottom_left(clip)
	// gl.Enable(gl.SCISSOR_TEST)
	// gl.Scissor(i32(clip_bl.x), i32(clip_bl.y), i32(clip_bl.w), i32(clip_bl.z))

	@(static) shader_program: u32
	@(static) vs_source, fs_source := #load("rect.vs", string), #load("rect.fs", string)

	@(static) uniform_window_size, uniform_animation_progress: i32

	@(static) vao, vbo: u32
	@(static) vertex_buffer: [6 * 2]Vertex
	//        ^ vao contains attributes to destribe vertex_buffer and vbo.
	//						 ^ vbo contains vertex_buffer.

	if shader_program == 0 {
		gl.GenVertexArrays(1, &vao)
		gl.BindVertexArray(vao)

		gl.GenBuffers(1, &vbo)
		gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
		gl.BufferData(gl.ARRAY_BUFFER, size_of(vertex_buffer), nil, gl.DYNAMIC_DRAW)

		gl.EnableVertexAttribArray(u32(Vertex_Attrib.Pos))
		gl.VertexAttribPointer(
			u32(Vertex_Attrib.Pos),
			2,
			gl.FLOAT,
			gl.FALSE,
			size_of(Vertex),
			offset_of(Vertex, pos),
		)

		gl.EnableVertexAttribArray(u32(Vertex_Attrib.ColorA))
		gl.VertexAttribPointer(
			u32(Vertex_Attrib.ColorA),
			4,
			gl.FLOAT,
			gl.FALSE,
			size_of(Vertex),
			offset_of(Vertex, color_a),
		)

		gl.EnableVertexAttribArray(u32(Vertex_Attrib.ColorB))
		gl.VertexAttribPointer(
			u32(Vertex_Attrib.ColorB),
			4,
			gl.FLOAT,
			gl.FALSE,
			size_of(Vertex),
			offset_of(Vertex, color_b),
		)

		shader_program, _ = gl.load_shaders_source(vs_source, fs_source)
		uniform_window_size = gl.GetUniformLocation(shader_program, "window_size")
		uniform_animation_progress = gl.GetUniformLocation(shader_program, "animation_progress")
	}

	gl.UseProgram(shader_program)

	gl.Uniform2f(uniform_window_size, window.bounds.w, window.bounds.z)
	// 					 ^ Can I set it only once in a while?
	gl.Uniform1f(uniform_animation_progress, animation_progress)

	gl.BindVertexArray(vao)
	gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
	Vertex :: struct {
		pos:              [2]f32,
		color_a, color_b: [4]f32,
		//     ^ Why color for vertex? Because of implicit GPU linear
		//			 interpolation of in/out(s) like the before deprected
		//			 varying(s)?
	}
	Vertex_Attrib :: enum {
		Pos,
		ColorA,
		ColorB,
	}
	vertex_buffer = {
		{{border_a.x, border_a.y}, border_color_a, border_color_b},
		{{border_a.x + border_a.w, border_a.y}, border_color_a, border_color_b},
		{{border_a.x, border_a.y + border_a.z}, border_color_a, border_color_b},
		{{border_a.x, border_a.y + border_a.z}, border_color_a, border_color_b},
		{{border_a.x + border_a.w, border_a.y + border_a.z}, border_color_a, border_color_b},
		{{border_a.x + border_a.w, border_a.y}, border_color_a, border_color_b},
		{{a.x, a.y}, color_a, color_b},
		{{a.x + a.w, a.y}, color_a, color_b},
		{{a.x, a.y + a.z}, color_a, color_b},
		{{a.x, a.y + a.z}, color_a, color_b},
		{{a.x + a.w, a.y + a.z}, color_a, color_b},
		{{a.x + a.w, a.y}, color_a, color_b},
	}
	gl.BufferSubData(gl.ARRAY_BUFFER, 0, size_of(vertex_buffer), &vertex_buffer[0])

	gl.DrawArraysInstanced(gl.TRIANGLES, 0, len(vertex_buffer), 1)

	// gl.Disable(gl.SCISSOR_TEST)
}

rect_to_bottom_left :: proc(a: [4]f32) -> [4]f32 {
	a := a
	a.y = window.bounds.z - a.y - a.z
	return a
}

rect_offset :: proc(a: [4]f32, offset: [2]f32) -> [4]f32 {
	a := [4]f32{a.x + offset.x, a.y + offset.y, a.z - offset.y * 2, a.w - offset.x * 2}
	return a
}

rect_bounding :: proc(a, b: [4]f32) -> [4]f32 {
	rect: [4]f32 = ---
	rect.x = min(a.x, b.x)
	rect.y = min(a.y, b.y)
	rect.w = max(a.x + a.w, b.x + b.w) - rect.x
	rect.z = max(a.y + a.z, b.y + b.z) - rect.y
	return rect
}

rect_not_zero :: proc(a: [4]f32) -> bool {
	return a.w > 0 && a.z > 0
}

// ¹ Same problem of window_scale_discrete_low/high. Take a look there
//   for a deeper description.
rect_is_intersect :: proc(a, b: [4]f32) -> bool {
	// Here we have 1 pixel error. We could simply do -1 whenever I use 
	// .w/.z if it was a discrete step.
	// EDIT: I'm now using the -1 solution because I figured out that 
	//  		 rect_is_interesect is more critical than I thought: I use
	//			 it for clip calculation, that I use for drawing, so near
	//			 widgets overlap. Another example is the extra pixel error in
	//			 mouse interactions like hovering and clicking.
	// 			 Anyway, this could maybe be a problem only when using non-discrete
	//       values for widget position like when interpolating for an animation.
	//			 We'll see.
	if a.x + max(0, a.w - 1.0) < b.x ||
	   b.x + max(0, b.w - 1.0) < a.x ||
	   a.y + max(0, a.z - 1.0) < b.y ||
	   b.y + max(0, b.z - 1.0) < a.y {
		return false
	}
	return true
}

// ¹ Same problem of rect_is_intersect.
rect_intersect :: proc(
	a, b: [4]f32,
	rects: ..[4]f32,
	assert_intersect := true,
) -> (
	rect: [4]f32,
	is_intersect: bool,
) #optional_ok {
	if assert_intersect {
		if !rect_is_intersect(a, b) {
			return {}, false
		}
	}

	rect.x = max(a.x, b.x)
	rect.y = max(a.y, b.y)
	rect.w = min(a.x + a.w, b.x + b.w) - rect.x
	rect.z = min(a.y + a.z, b.y + b.z) - rect.y
	is_intersect = true

	for c in rects {
		rect, is_intersect = rect_intersect(rect, c)
	}
	return
}

text_size :: proc(text: string, font_index: int) -> (size: [2]f32) {
	font := font_at_index(font_index)

	size.y = font.line_height
	curr_row_size_x: f32
	for ch in text {
		if ch == '\n' {
			size.x = max(size.x, curr_row_size_x)
			curr_row_size_x = 0
			size.y += font.line_height
			continue
		}

		glyph := character_to_glyph(font, ch)
		curr_row_size_x += glyph.advance_x
	}
	size.x = max(size.x, curr_row_size_x)
	return
}

character_to_glyph :: proc(font: ^Font, ch: rune) -> ^Glyph {
	{
		glyph, is_rendered := &font.rendered_glyphs[ch]
		if is_rendered do return glyph
	}

	#assert(size_of(c.long) == size_of(rune))
	glyph_index := ft.get_char_index(font.ft_face, transmute(u32)ch)
	if glyph_index == 0 {
		glyph_index = ft.get_char_index(font.ft_face, 0xfffd)
		if glyph_index == 0 {
			glyph_index = ft.get_char_index(font.ft_face, '?')
			assert(glyph_index != 0)
		}
	}
	ft.load_glyph(font.ft_face, glyph_index, {})
	ft.render_glyph(font.ft_face.glyph, .LCD)

	ft_glyph := font.ft_face.glyph
	ft_bitmap_width := i32(ft_glyph.bitmap.width / 3)
	ft_bitmap_height := i32(ft_glyph.bitmap.rows)
	ft_bitmap_pitch := ft_glyph.bitmap.pitch
	ft_bitmap_buffer := ft_glyph.bitmap.buffer

	glyph: Glyph = ---
	glyph.width = f32(ft_bitmap_width)
	glyph.height = f32(ft_bitmap_height)
	glyph.advance_x = f32(ft_glyph.advance.x >> 6)
	glyph.offset = {f32(ft_glyph.bitmap_left), f32(-ft_glyph.bitmap_top)}
	buffer, _ := mem.alloc(int(ft_bitmap_width * ft_bitmap_height * 3 * 4))
	glyph.buffer = auto_cast buffer

	for y0 in 0 ..< ft_bitmap_height {
		for x0 in 0 ..< ft_bitmap_width {
			// glyph_offset := ft_bitmap_width * 3 * (ft_bitmap_height - y0 - 1) + x0 * 3
			glyph_offset := ft_bitmap_width * 3 * y0 + x0 * 3
			bitmap_offset := ft_bitmap_pitch * y0 + 3 * x0
			glyph.buffer[glyph_offset + 0] = f32(ft_bitmap_buffer[bitmap_offset + 0]) / 255.0
			glyph.buffer[glyph_offset + 1] = f32(ft_bitmap_buffer[bitmap_offset + 1]) / 255.0
			glyph.buffer[glyph_offset + 2] = f32(ft_bitmap_buffer[bitmap_offset + 2]) / 255.0
		}
	}

	font.rendered_glyphs[ch] = glyph
	return &font.rendered_glyphs[ch]
}

draw_text :: proc(
	text: string,
	color_a, color_b: [4]f32,
	animation_progress: f32,
	a: [4]f32,
	clip: [4]f32,
	font_index: int,
) {
	font := font_at_index(font_index)

	clip_bl := rect_to_bottom_left(clip)
	gl.Enable(gl.SCISSOR_TEST)
	gl.Scissor(i32(clip_bl.x), i32(clip_bl.y), i32(clip_bl.w), i32(clip_bl.z))
	gl.Disable(gl.BLEND)

	@(static) shader_program: u32

	@(static) vs_source, fs_source := #load("text.vs", string), #load("text.fs", string)

	// Maybe time for uniform buffer objects (UBOs)?
	@(static) uniform_window_size: i32
	@(static) uniform_rect_size: i32
	@(static) uniform_rect_offset_from_window_origin: i32
	@(static) uniform_offscreen_framebuffer_texture: i32
	@(static) uniform_alpha_texture: i32
	@(static) uniform_text_color_a: i32
	@(static) uniform_text_color_b: i32
	@(static) uniform_animation_progress: i32

	@(static) vao, vbo: u32
	@(static) vertex_buffer: [6]Vertex
	Vertex :: struct {
		pos: [2]f32,
	}
	Vertex_Attrib :: enum {
		Pos,
	}
	@(static) alpha_texture: u32

	if shader_program == 0 {
		gl.GenVertexArrays(1, &vao)
		gl.BindVertexArray(vao)

		gl.GenBuffers(1, &vbo)
		gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
		gl.BufferData(gl.ARRAY_BUFFER, size_of(vertex_buffer), nil, gl.DYNAMIC_DRAW)

		gl.EnableVertexAttribArray(u32(Vertex_Attrib.Pos))
		gl.VertexAttribPointer(
			u32(Vertex_Attrib.Pos),
			2,
			gl.FLOAT,
			gl.FALSE,
			size_of(Vertex),
			offset_of(Vertex, pos),
		)

		gl.GenTextures(1, &alpha_texture)
		gl.ActiveTexture(gl.TEXTURE1)
		gl.BindTexture(gl.TEXTURE_2D, alpha_texture)

		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)

		shader_program, _ = gl.load_shaders_source(vs_source, fs_source)
		uniform_window_size = gl.GetUniformLocation(shader_program, "window_size")
		uniform_rect_offset_from_window_origin = gl.GetUniformLocation(
			shader_program,
			"rect_offset_from_window_origin",
		)
		uniform_rect_size = gl.GetUniformLocation(shader_program, "rect_size")
		uniform_offscreen_framebuffer_texture = gl.GetUniformLocation(
			shader_program,
			"offscreen_framebuffer_texture",
		)
		uniform_alpha_texture = gl.GetUniformLocation(shader_program, "alpha_texture")
		uniform_text_color_a = gl.GetUniformLocation(shader_program, "text_color_a")
		uniform_text_color_b = gl.GetUniformLocation(shader_program, "text_color_b")
		uniform_animation_progress = gl.GetUniformLocation(shader_program, "animation_progress")
	}

	gl.UseProgram(shader_program)

	gl.Uniform2f(uniform_window_size, window.bounds.w, window.bounds.z)
	gl.Uniform1i(uniform_offscreen_framebuffer_texture, OFFSCREEN_FRAMEBUFFER_TEXTURE)
	gl.Uniform1i(uniform_alpha_texture, 1)
	gl.Uniform4f(uniform_text_color_a, color_a.r, color_a.g, color_a.b, color_a.a)
	gl.Uniform4f(uniform_text_color_b, color_b.r, color_b.g, color_b.b, color_b.a)
	gl.Uniform1f(uniform_animation_progress, animation_progress)

	x, y := a.x, a.y
	init_x := x
	skip_line := false
	for ch in text {
		if ch == '\n' {
			x = init_x
			y += font.line_height
			skip_line = false
			continue
		} else if skip_line do continue

		glyph := character_to_glyph(font, ch)
		a := [4]f32 {
			x + glyph.offset.x,
			y + font.offset_y_for_baseline + glyph.offset.y,
			glyph.height,
			glyph.width,
		}
		x += glyph.advance_x

		if ch == ' ' do continue // Space glyph's metrics are fucked, 
		//													you cannot use them for this calculation.
		//													Furthermore, I rely on the fact you rarely
		//													encounter more than one space streak.
		// Here we have 1 pixel error. We could simply do -1 whenever I use 
		// .w/.z if it was a discrete step.
		if is_above := a.y + a.z < clip.y; is_above {
			skip_line = true
			continue
		} else if is_below := a.y > clip.y + clip.z; is_below do break
		else if is_right := a.x > clip.x + clip.w; is_right {
			skip_line = true
			continue
		} else if is_left := a.x + a.w < clip.x; is_left do continue

		gl.ActiveTexture(gl.TEXTURE1)
		gl.BindTexture(gl.TEXTURE_2D, alpha_texture)
		gl.TexImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB32F,
			i32(glyph.width),
			i32(glyph.height),
			0,
			gl.RGB,
			gl.FLOAT,
			glyph.buffer,
		)
		rect_offset_from_window_origin := a.xy - rect_to_bottom_left(window.bounds).xy
		gl.Uniform2f(
			uniform_rect_offset_from_window_origin,
			rect_offset_from_window_origin.x,
			rect_offset_from_window_origin.y,
		)
		gl.Uniform2f(uniform_rect_size, a.w, a.z)

		gl.BindVertexArray(vao)
		gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
		vertex_buffer = {
			{{a.x, a.y}},
			{{a.x + a.w, a.y}},
			{{a.x, a.y + a.z}},
			{{a.x, a.y + a.z}},
			{{a.x + a.w, a.y + a.z}},
			{{a.x + a.w, a.y}},
		}
		gl.BufferSubData(gl.ARRAY_BUFFER, 0, size_of(vertex_buffer), &vertex_buffer[0])

		gl.DrawArraysInstanced(gl.TRIANGLES, 0, len(vertex_buffer), 1)
	}

	gl.Disable(gl.SCISSOR_TEST)
	gl.Enable(gl.BLEND)
}
