package main

import "base:intrinsics"
import "base:runtime"
import "core:fmt"
import "core:math"
import "core:mem"
import os "core:os/os2"
import "core:reflect"
import "core:slice"
import "core:strconv"
import "core:strings"
import "core:sync"
import "core:sync/chan"
import "core:sys/windows"
import "core:thread"
import "core:time"
import ft "freetype"
import "ui"

#assert(size_of(rawptr) == size_of(u64))
#assert(ODIN_OS == .Windows)


font_inter: int
font_icons: int

main :: proc() {
	start := time.now()

	when ODIN_DEBUG {
		track: mem.Tracking_Allocator
		mem.tracking_allocator_init(&track, context.allocator)
		context.allocator = mem.tracking_allocator(&track)

		defer {
			if len(track.allocation_map) > 0 {
				fmt.eprintf("=== %v allocations not freed: ===\n", len(track.allocation_map))
				for _, entry in track.allocation_map {
					fmt.eprintf("- %v bytes @ %v\n", entry.size, entry.location)
				}
			}
			if len(track.bad_free_array) > 0 {
				fmt.eprintf("=== %v incorrect frees: ===\n", len(track.bad_free_array))
				for entry in track.bad_free_array {
					fmt.eprintf("- %p @ %v\n", entry.memory, entry.location)
				}
			}
			mem.tracking_allocator_destroy(&track)
		}
	}


	window := ui.widget_make_window("test")

	executable_dir, executable_dir_err := os.get_executable_directory(context.allocator)
	assert(executable_dir_err == nil)
	os.set_working_directory(executable_dir)
	delete(executable_dir)

	font_inter = ui.font_create(`Inter-VariableFont_opsz,wght.ttf`, 11)
	// font_icons = ui.font_create(`icons.ttf`, 13)

	ui.font_stack_push(font_inter)

	ui.parent_push(window)
	horizontal_panel_0 := ui.widget_make_panel(
		flags = {.Panel_Horizontal, .Panel_Fill_Horz, .Panel_Fill_Vert},
	)
	ui.parent_pop()

	ui.parent_push(horizontal_panel_0)
	ui.widget_make_button("test", proc(widget: rawptr) {fmt.println("test")})
	ui.parent_pop()

	fmt.println("init", time.since(start))

	ui.message_loop()
}
