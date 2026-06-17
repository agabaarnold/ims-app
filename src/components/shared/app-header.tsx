import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

function AppHeader() {
    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-2 shadow backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" />
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    );
}

export default AppHeader;
