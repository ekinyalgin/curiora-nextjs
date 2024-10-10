import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Application</h1>
      {session ? (
        <p>Hello, {session.user?.name}! You are logged in.</p>
      ) : (
        <p>Please sign in to access all features.</p>
      )}
      {/* Add more content for your home page here */}
    </div>
  );
}