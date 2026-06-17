import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";

import {
    syncUser
} from "../services/userService";

export const useUserSync =
    () => {

        const { getToken } = useAuth();
        const { user } =
            useUser();

        useEffect(() => {

            if (!user)
                return;

            (async () => {
                const token = await getToken();
                await syncUser({
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || "User"
                }, token);
            })();

        }, [user, getToken]);

    };