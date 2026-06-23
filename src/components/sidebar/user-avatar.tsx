import type { User } from "#/lib/auth";
import { getInitials } from "#/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserAvatarProps {
    user: User;
}

function UserAvatar({ user }: UserAvatarProps) {
    const initials = getInitials(user.name);

    return (
        <>
            <Avatar>
                <AvatarImage alt={user.name} src={user.image ?? undefined} />
                <AvatarFallback className="rounded-lg">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
            </div>
        </>
    );
}

export default UserAvatar;
