"use client";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import { LoadingCard } from "@/src/components/ui/Loading";
import { usefeedbackStore } from "@/src/store/feedbackStore";
import axios from "axios";
import { useEffect, useState } from "react";

const categoryData = [
  { label: "Feature Request", value: 245, color: "bg-indigo-500" },
  { label: "Bug", value: 89, color: "bg-red-500" },
  { label: "Praise", value: 178, color: "bg-emerald-500" },
  { label: "UI/UX", value: 67, color: "bg-amber-500" },
  { label: "Performance", value: 45, color: "bg-purple-500" },
  { label: "Support", value: 112, color: "bg-blue-500" },
  { label: "Pricing", value: 34, color: "bg-pink-500" },
  { label: "Other", value: 95, color: "bg-zinc-500" },
];

const monthlyTrends = [
  { month: "Aug", feedbacks: 120, positive: 80, negative: 15 },
  { month: "Sep", feedbacks: 145, positive: 95, negative: 20 },
  { month: "Oct", feedbacks: 180, positive: 120, negative: 25 },
  { month: "Nov", feedbacks: 210, positive: 145, negative: 22 },
  { month: "Dec", feedbacks: 195, positive: 130, negative: 28 },
  { month: "Jan", feedbacks: 234, positive: 160, negative: 18 },

];

const topKeywords = [
  { word: "dashboard", count: 89, sentiment: "positive" },
  { word: "slow", count: 67, sentiment: "negative" },
  { word: "feature", count: 156, sentiment: "neutral" },
  { word: "easy", count: 112, sentiment: "positive" },
  { word: "crash", count: 45, sentiment: "negative" },
  { word: "love", count: 98, sentiment: "positive" },
  { word: "bug", count: 78, sentiment: "negative" },
  { word: "helpful", count: 134, sentiment: "positive" },
];



export default function AnalyticsPage() {
  const [categoryCounts, setcategoryCounts] = useState<Array<{ primary_category: string; _count: number }>>([]);
  const maxFeedback = Math.max(...monthlyTrends.map((m) => m.feedbacks));
  const totalCategory = categoryData.reduce((acc, c) => acc + c.value, 0);
  const totalFeedbacks = usefeedbackStore(state => state.feedbacks.length);
  const fetchFeedbacks = usefeedbackStore(state => state.fetchFeedbacks);
  const loading = usefeedbackStore(state => state.loading);
  useEffect(() => {
    async function fetchCategories() {
      const res = await axios.get('/api/v1/getCategory');
      setcategoryCounts(res.data.categories);
      console.log(res.data.categories);
    }
    fetchFeedbacks();
    fetchCategories();
  }, []);
  const feedbacks = usefeedbackStore(state => state.feedbacks);
  console.log(feedbacks);

  function thisMonthFeedbackCount() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thismonth = feedbacks.filter((feedback) => {
      const createdAt = new Date(feedback.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    })
    return thismonth.length;
  }

  // Calculate sentiment data from actual feedbacks
  const sentimentCounts = {
    Positive: feedbacks.filter(f => f.sentiment === "Positive").length,
    Neutral: feedbacks.filter(f => f.sentiment === "Neutral").length,
    Negative: feedbacks.filter(f => f.sentiment === "Negative").length,
  };

  const sentimentData = [
    {
      label: "Positive",
      value: totalFeedbacks > 0 ? Math.round((sentimentCounts.Positive / totalFeedbacks) * 100) : 0,
      count: sentimentCounts.Positive,
      color: "bg-emerald-500",
      stroke: "#10b981"
    },
    {
      label: "Neutral",
      value: totalFeedbacks > 0 ? Math.round((sentimentCounts.Neutral / totalFeedbacks) * 100) : 0,
      count: sentimentCounts.Neutral,
      color: "bg-zinc-400",
      stroke: "#a1a1aa"
    },
    {
      label: "Negative",
      value: totalFeedbacks > 0 ? Math.round((sentimentCounts.Negative / totalFeedbacks) * 100) : 0,
      count: sentimentCounts.Negative,
      color: "bg-red-500",
      stroke: "#ef4444"
    },
  ];

  function highestSentimentRate() {
    const positiveRate = sentimentData[0].value;
    const neutralRate = sentimentData[1].value;
    const negativeRate = sentimentData[2].value;
    if (positiveRate >= neutralRate && positiveRate >= negativeRate) {
      return {
        value: positiveRate,
        label: "Positive"
      };
    }
    if (neutralRate >= positiveRate && neutralRate >= negativeRate) {
      return {
        value: neutralRate,
        label: "Neutral"
      }
    }
    else return {
      value: negativeRate,
      label: "Negative"
    }
  }

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Insights and trends from your customer feedback
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Feedbacks
                  </p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
                    {feedbacks.length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Feedbacks This Month
                  </p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
                    {thisMonthFeedbackCount()}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Highest Sentiment Rate
                  </p>
                  {highestSentimentRate().label == "Positive" && (
                    <p className="text-3xl font-bold text-green-900 dark:text-green-600 mt-2">
                      {highestSentimentRate().value}% <span className="text-xl font-thin">positive</span>
                    </p>
                  )}
                  {highestSentimentRate().label == "Neutral" && (
                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-500 mt-2">
                      {highestSentimentRate().value}% <span className="text-xl font-thin">neutral</span>
                    </p>
                  )}
                  {highestSentimentRate().label == "Negative" && (
                    <p className="text-3xl font-bold text-red-900 dark:text-red-600 mt-2">
                      {highestSentimentRate().value}% <span className="text-xl font-thin">negative</span>
                    </p>
                  )}

                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Breakdown */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Sentiment Breakdown
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                {/* Simple donut chart representation */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f4f4f5" strokeWidth="12" className="dark:stroke-zinc-800" />
                    {/* Positive */}
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={sentimentData[0].stroke} strokeWidth="12"
                      strokeDasharray={`${sentimentData[0].value * 2.51} ${100 * 2.51}`}
                      strokeDashoffset="0"
                    />
                    {/* Neutral */}
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={sentimentData[1].stroke} strokeWidth="12"
                      strokeDasharray={`${sentimentData[1].value * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-sentimentData[0].value * 2.51}`}
                    />
                    {/* Negative */}
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={sentimentData[2].stroke} strokeWidth="12"
                      strokeDasharray={`${sentimentData[2].value * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-(sentimentData[0].value + sentimentData[1].value) * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{sentimentData[0].value}%</p>
                    <p className="text-sm text-zinc-500">Positive</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6">
                {sentimentData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {item.label} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Monthly Trends
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2 pt-4">
                {monthlyTrends.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-linear-to-t from-indigo-600 to-purple-600 rounded-t-sm transition-all duration-500"
                        style={{ height: `${(month.feedbacks / maxFeedback) * 150}px` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">+18%</p>
                  <p className="text-sm text-zinc-500">vs last month</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-medium">Trending up</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Category Distribution
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <LoadingCard />
              ) : (
                categoryDistribution.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-700 dark:text-zinc-300">{category.name}</span>
                      <span className="text-zinc-500">
                        {category.count} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full transition-all duration-500`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}

            </CardContent>
          </Card>

          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Top Keywords
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topKeywords.map((keyword) => (
                  <div
                    key={keyword.word}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium
                      ${keyword.sentiment === "positive"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : keyword.sentiment === "negative"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }
                    `}
                  >
                    {keyword.word}
                    <span className="ml-1 opacity-60">({keyword.count})</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Keywords are extracted automatically from feedback and colored by sentiment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
