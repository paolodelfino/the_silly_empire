prepare_build_code:
	mkdir -p build && cp freetype/freetyped.dll build/freetyped.dll && cp assets/* build

odin_code:
	odin run . -debug -o:none -out:./build/odin_code.exe -extra-linker-flags:"/NODEFAULTLIB:LIBCMTD" -keep-executable

odin_code_vetted:
	odin run . -debug -o:none -out:./build/odin_code.exe -extra-linker-flags:"/NODEFAULTLIB:LIBCMTD" -vet-unused -vet-packages:"main, ui" -vet-unused-procedures keep-executable

odin_ui:
	cd ./ui/test/ && odin run . -debug -o:none -out:odin_ui.exe

odin_ui_opt:
	cd ./ui/test/ && odin run . -o:aggressive -out:odin_ui.exe
