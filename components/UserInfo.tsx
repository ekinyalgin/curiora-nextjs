import Image from 'next/image'

interface UserInfoProps {
      user: {
            name: string
            image?: string
            role: string
      }
}

export default function UserInfoComponent({ user }: UserInfoProps) {
      return (
            <div className="flex items-center space-x-3">
                  {user.image ? (
                        <Image src={user.image} alt={user.name} width={40} height={40} className="rounded-full" />
                  ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-lg">{user.name.charAt(0)}</span>
                        </div>
                  )}
                  <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
            </div>
      )
}
