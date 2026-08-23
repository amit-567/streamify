import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { VideoIcon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let isSubscribed = true;

    const initChat = async () => {
      if (!tokenData?.token || !authUser?._id || !targetUserId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        const userIdStr = authUser._id.toString();

        if (client.user || client.userID) {
          await client.disconnectUser();
        }

        await client.connectUser(
          {
            id: userIdStr,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        if (!isSubscribed) return;

        const channelId = [userIdStr, targetUserId.toString()].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [userIdStr, targetUserId.toString()],
        });

        await currChannel.watch();

        if (isSubscribed) {
          setChatClient(client);
          setChannel(currChannel);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (isSubscribed) {
          toast.error("Could not connect to chat. Please try again.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initChat();

    return () => {
      isSubscribed = false;
    };
  }, [tokenData?.token, authUser?._id, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call invitation sent!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-base-100 overflow-hidden">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col relative">
            <div className="absolute right-4 top-3.5 z-20">
              <button
                onClick={handleVideoCall}
                className="btn btn-primary btn-sm gap-2 shadow-sm rounded-md"
              >
                <VideoIcon className="size-4" />
                <span className="hidden sm:inline font-semibold">Start Video Call</span>
              </button>
            </div>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
