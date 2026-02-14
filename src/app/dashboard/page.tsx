import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Link from "next/link";
import prisma from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth";
import { JSX } from "react";

async function getDashboardData(organizationId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    totalFeedbacks,
    sentimentCounts,
    categoryCounts,
    recentFeedback,
    thisMonthFeedbacks,
    lastMonthFeedbacks,
    thisMonthSentimentCounts,
    lastMonthSentimentCounts,
    thisMonthCategoryCounts,
    lastMonthCategoryCounts,
  ] = await Promise.all([
    prisma.feedback.count({
      where: { organizationId },
    }),
    prisma.feedback.groupBy({
      where: { organizationId },
      by: ['sentiment'],
      _count: true,
    }),
    prisma.feedback.groupBy({
      where: { organizationId },
      by: ['primary_category'],
      _count: true,
    }),
    prisma.feedback.findMany({
      where: { organizationId },
      take: 7,
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedback.count({
      where: {
        organizationId,
        createdAt: { gte: thisMonthStart }
      },
    }),
    prisma.feedback.count({
      where: { 
        organizationId,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
      },
    }),
    prisma.feedback.groupBy({
      by: ['sentiment'],
      where: { 
        organizationId,
        createdAt: { gte: thisMonthStart }
      },
      _count: true,
    }),
    prisma.feedback.groupBy({
      by: ['sentiment'],
      where: { 
        organizationId,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      _count: true,
    }),
    prisma.feedback.groupBy({
      where: { 
        organizationId,
        createdAt: { gte: thisMonthStart }
      },
      by: ['primary_category'],
      _count: true,
    }),
    prisma.feedback.groupBy({
      where: { 
        organizationId,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      by: ['primary_category'],
      _count: true,
    }),
  ]);
  
  const feedbackIncrementPercent = lastMonthFeedbacks > 0
    ? Math.round(((thisMonthFeedbacks - lastMonthFeedbacks) / lastMonthFeedbacks) * 100)
    : (thisMonthFeedbacks > 0 ? 100 : 0);

  const positiveCount = sentimentCounts.find(s => s.sentiment === "Positive")?._count || 0;
  const positivePercentage = totalFeedbacks > 0 ? Math.round((positiveCount / totalFeedbacks) * 100) : 0;

  // Get top 2 categories with increment percentages
  const top2Categories = categoryCounts
    .sort((a, b) => b._count - a._count)
    .slice(0, 2)
    .map(cat => {
      const thisMonthCount = thisMonthCategoryCounts.find(c => c.primary_category === cat.primary_category)?._count || 0;
      const lastMonthCount = lastMonthCategoryCounts.find(c => c.primary_category === cat.primary_category)?._count || 0;
      const incrementPercent = lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : (thisMonthCount > 0 ? 100 : 0);
      
      return {
        category: cat.primary_category,
        count: cat._count,
        incrementPercent,
      };
    });

  // Calculate sentiment increment percentages synchronously from pre-fetched data
  function getIncrementPercent(sentiment: string) {
    const thisMonthCount = thisMonthSentimentCounts.find(s => s.sentiment === sentiment)?._count || 0;
    const lastMonthCount = lastMonthSentimentCounts.find(s => s.sentiment === sentiment)?._count || 0;
    return lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : (thisMonthCount > 0 ? 100 : 0);
  }

  const positiveIncrementPercent = getIncrementPercent("Positive");
  const negativeIncrementPercent = getIncrementPercent("Negative");
  const neutralIncrementPercent = getIncrementPercent("Neutral");

  return {
    totalFeedbacks,
    feedbackIncrementPercent,
    positivePercentage,
    positiveIncrementPercent,
    negativeIncrementPercent,
    neutralIncrementPercent,
    top2Categories,
    recentFeedback,
    categoryCounts,
  };

}

function getStats(data: { 
  totalFeedbacks: number; 
  feedbackIncrementPercent: number; 
  positivePercentage: number; 
  positiveIncrementPercent: number; 
  top2Categories: { category: string; count: number; incrementPercent: number }[] 
}) {
  const incrementSign = data.feedbackIncrementPercent >= 0 ? "+" : "";
  
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, JSX.Element> = {
      Feature_Request: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      Bug: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      Praise: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      UI_UX: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      Performance: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    };
    return iconMap[category] || (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    );
  };

  const stats = [
    {
      label: "Total Feedbacks",
      value: data.totalFeedbacks.toLocaleString(),
      change: `${incrementSign}${data.feedbackIncrementPercent}%`,
      changeType: data.feedbackIncrementPercent >= 0 ? "positive" : "negative",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      label: "Positive Sentiment",
      value: `${data.positivePercentage}%`,
      change: `${data.positiveIncrementPercent >= 0 ? "+" : ""}${data.positiveIncrementPercent}%`,
      changeType: data.positiveIncrementPercent >= 0 ? "positive" : "negative",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Add top 2 categories dynamically
  data.top2Categories.forEach(cat => {
    stats.push({
      label: cat.category.replace("_", " "),
      value: cat.count.toLocaleString(),
      change: `${cat.incrementPercent >= 0 ? "+" : ""}${cat.incrementPercent}%`,
      changeType: cat.incrementPercent >= 0 ? "positive" : "negative",
      icon: getCategoryIcon(cat.category),
    });
  });

  return stats;
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function getSentimentBadge(sentiment: string) {
  switch (sentiment) {
    case "Positive":
      return <Badge variant="success">{sentiment}</Badge>;
    case "Negative":
      return <Badge variant="danger">{sentiment}</Badge>;
    default:
      return <Badge variant="default">{sentiment}</Badge>;
  }
}

function getCategoryBadge(category: string) {
  switch (category) {
    case "Bug":
      return <Badge variant="danger">{category.replace("_", " ")}</Badge>;
    case "Feature_Request":
      return <Badge variant="info">{category.replace("_", " ")}</Badge>;
    case "Praise":
      return <Badge variant="success">{category.replace("_", " ")}</Badge>;
    case "Performance":
      return <Badge variant="warning">{category.replace("_", " ")}</Badge>;
    default:
      return <Badge variant="purple">{category.replace("_", " ")}</Badge>;
  }
}


export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { totalFeedbacks, feedbackIncrementPercent, positivePercentage, positiveIncrementPercent, top2Categories, recentFeedback, categoryCounts } = await getDashboardData(session.user.organizationId);
  const stats = getStats({ totalFeedbacks, feedbackIncrementPercent, positivePercentage, positiveIncrementPercent, top2Categories });

  // Calculate category distribution dynamically
  const categoryDistribution = categoryCounts.map(cat => {
    const percentage = totalFeedbacks > 0 ? Math.round((cat._count / totalFeedbacks) * 100) : 0;
    const colorMap: Record<string, string> = {
      Feature_Request: "bg-indigo-500",
      Bug: "bg-red-500",
      Praise: "bg-emerald-500",
      Positive_Feedback: "bg-emerald-500",
      UI_UX: "bg-amber-500",
      Performance: "bg-orange-500",
      Pricing: "bg-purple-500",
      Support: "bg-blue-500",
      Other: "bg-zinc-500",
    };
    return {
      name: cat.primary_category.replace("_", " "),
      count: cat._count,
      percentage,
      color: colorMap[cat.primary_category] || "bg-zinc-500",
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Welcome back! <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">{session.user.organizationName}</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Here&apos;s what&apos;s happening with your feedback today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/dashboard/upload">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CSV
              </Button>
            </Link>
            <Link href="/dashboard/feedbacks">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className={`flex items-center mt-2 text-sm ${stat.changeType === "positive" ? "text-emerald-600" : "text-red-600"
                      }`}>
                      <svg className={`w-4 h-4 mr-1 ${stat.changeType === "negative" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {stat.change} from last month
                    </div>
                  </div>
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Feedback */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Recent Feedbacks
                </h2>
                <Link href="/dashboard/feedbacks" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                  View all →
                </Link>
              </CardHeader>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <p className="text-sm text-zinc-900 dark:text-white line-clamp-2 mb-3">
                      {feedback.feedback_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(feedback.primary_category)}
                      {getSentimentBadge(feedback.sentiment)}
                      <span className="text-xs text-zinc-500 ml-auto">{timeAgo(feedback.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Category Distribution */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Category Distribution
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryDistribution.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-700 dark:text-zinc-300">{category.name}</span>
                      <span className="text-zinc-500">{category.count}</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full transition-all duration-500`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Quick Actions
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Upload CSV</p>
                    <p className="text-xs text-zinc-500">Import feedback in bulk</p>
                  </div>
                </Link>
                <Link href="/dashboard/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">View Analytics</p>
                    <p className="text-xs text-zinc-500">Explore trends and insights</p>
                  </div>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Settings</p>
                    <p className="text-xs text-zinc-500">Configure your account</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}