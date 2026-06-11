import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button size="icon" variant="outline">
                        <IconSun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <IconMoon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                }
            />

            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <IconSun className="mr-2" /> Light
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <IconMoon className="mr-2" /> Dark
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <IconDeviceLaptop className="mr-2" /> System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
