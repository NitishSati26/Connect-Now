import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  const hasActiveChat = selectedUser || selectedGroup;

  return (
    <div className="h-screen bg-base-200 pt-16">
      <div className="h-full w-full">
        <div className="bg-base-100 h-full">
          <div className="flex h-full">
            <Sidebar />

            {!hasActiveChat ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
