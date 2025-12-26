import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6 p-8 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          活码生成平台
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          创建可随时更新内容的动态二维码。高效追踪访问数据，管理您的活码。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">登录</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">注册</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
