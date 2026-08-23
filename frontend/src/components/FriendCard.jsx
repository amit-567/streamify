import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest } from "../lib/api";
import { LANGUAGE_TO_FLAG } from "../constants";

import Avatar from "./Avatar";

const FriendCard = ({ friend, requestId, isPendingRequest }) => {
  const queryClient = useQueryClient();
  const { mutate: acceptRequest } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12 rounded-full overflow-hidden">
            <Avatar src={friend?.profilePic} name={friend?.fullName} className="size-12 rounded-full" />
          </div>
          <h3 className="font-semibold truncate">{friend?.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        {isPendingRequest ? (
          <div className="flex gap-2">
            <button 
              onClick={() => acceptRequest(requestId)}
              className="btn btn-primary flex-1"
            >
              Accept Request
            </button>
            <Link to={`/chat/${friend._id}`} className="btn btn-outline">
              Message
            </Link>
          </div>
        ) : (
          <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
            Message
          </Link>
        )}
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
