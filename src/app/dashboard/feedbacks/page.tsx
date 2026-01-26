"use client";
import { use, useEffect, useState } from "react";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { useSession } from "next-auth/react";
import axios from "axios";

// Mock data - in production, fetch from API

const mockFeedbacks = [
  { id: "1", text: "Love the new dashboard! It's so much easier to navigate and find what I need.", category: "Praise", sentiment: "Positive", confidence: 0.95, source: "Email", status: "auto_approved", createdAt: "2026-01-23T10:30:00Z" },
  { id: "2", text: "The export feature crashes when selecting more than 100 items. Please fix this ASAP.", category: "Bug", sentiment: "Negative", confidence: 0.89, source: "Support", status: "auto_approved", createdAt: "2026-01-23T09:15:00Z" },
  { id: "3", text: "Would be great to have dark mode support for the mobile app.", category: "Feature_Request", sentiment: "Neutral", confidence: 0.92, source: "Survey", status: "auto_approved", createdAt: "2026-01-23T08:45:00Z" },
  { id: "4", text: "Loading times are too slow on mobile devices. Takes 5+ seconds to load.", category: "Performance", sentiment: "Negative", confidence: 0.87, source: "App Store", status: "auto_approved", createdAt: "2026-01-22T16:20:00Z" },
  { id: "5", text: "Customer support was incredibly helpful and quick to resolve my issue!", category: "Support", sentiment: "Positive", confidence: 0.94, source: "Email", status: "auto_approved", createdAt: "2026-01-22T14:00:00Z" },
  { id: "6", text: "The new pricing tier is too expensive for small businesses like ours.", category: "Pricing", sentiment: "Negative", confidence: 0.88, source: "Survey", status: "auto_approved", createdAt: "2026-01-22T11:30:00Z" },
  { id: "7", text: "The button placement in the header is confusing. Had trouble finding settings.", category: "UI_UX", sentiment: "Negative", confidence: 0.85, source: "Feedback Form", status: "auto_approved", createdAt: "2026-01-22T09:45:00Z" },
  { id: "8", text: "Overall a solid product. Meets most of our needs.", category: "Positive_Feedback", sentiment: "Positive", confidence: 0.82, source: "Survey", status: "auto_approved", createdAt: "2026-01-21T15:00:00Z" },
];

const categories = ["All", "Bug", "Feature_Request", "Performance", "UI_UX", "Positive_Feedback", "Pricing", "Support", "Praise", "Other"];
const sentiments = ["All", "Positive", "Neutral", "Negative"];

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
    case "Positive_Feedback":
      return <Badge variant="success">{category.replace("_", " ")}</Badge>;
    case "Performance":
      return <Badge variant="warning">{category.replace("_", " ")}</Badge>;
    case "Pricing":
      return <Badge variant="purple">{category.replace("_", " ")}</Badge>;
    default:
      return <Badge variant="default">{category.replace("_", " ")}</Badge>;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function FeedbacksPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [selectedFeedback, setSelectedFeedback] = useState<typeof mockFeedbacks[0] | null>(null);

  const filteredFeedbacks = mockFeedbacks.filter((feedback) => {
    const matchesSearch = feedback.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || feedback.category === selectedCategory;
    const matchesSentiment = selectedSentiment === "All" || feedback.sentiment === selectedSentiment;
    return matchesSearch && matchesCategory && matchesSentiment;
  });

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const response = await axios('/api/v1/feedbacks');
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
      }

    }
    fetchFeedbacks();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Feedbacks
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Browse and filter all your categorized feedback
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search feedback..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "All" ? "All Categories" : category.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sentiments.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {sentiment === "All" ? "All Sentiments" : sentiment}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-zinc-500 mb-4">
          Showing {filteredFeedbacks.length} of {mockFeedbacks.length} feedbacks
        </p>

        {/* Feedback List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredFeedbacks.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">No feedback found matching your filters.</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      onClick={() => setSelectedFeedback(feedback)}
                      className={`px-6 py-4 cursor-pointer transition-colors ${selectedFeedback?.id === feedback.id
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                    >
                      <p className="text-sm text-zinc-900 dark:text-white line-clamp-2 mb-3">
                        {feedback.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(feedback.category)}
                        {getSentimentBadge(feedback.sentiment)}
                        <span className="text-xs text-zinc-500 ml-auto">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Detail Panel */}
          <div>
            {selectedFeedback ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Feedback Details
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Feedback
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                      {selectedFeedback.text}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Category
                      </label>
                      <div className="mt-1">
                        {getCategoryBadge(selectedFeedback.category)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Sentiment
                      </label>
                      <div className="mt-1">
                        {getSentimentBadge(selectedFeedback.sentiment)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Confidence
                      </label>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-indigo-600 to-purple-600 rounded-full"
                              style={{ width: `${selectedFeedback.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">
                            {(selectedFeedback.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Source
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                        {selectedFeedback.source || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge variant="success">
                        {selectedFeedback.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                      {formatDate(selectedFeedback.createdAt)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button variant="outline" className="w-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Select a feedback to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
