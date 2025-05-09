"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface UserIdWrapperProps {
  onUserId: (id: string | null) => void;
}

const UserIdWrapper: React.FC<UserIdWrapperProps> = ({ onUserId }) => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userid");

  useEffect(() => {
    onUserId(userId);
  }, [userId, onUserId]);

  return null; // No visual output
};

export default UserIdWrapper;
