"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "./AdminGuard";

type Stats = {
total_sessions: number;
total_questions: number;
total_messages: number;
active_today: number;
positive_feedback: number;
negative_feedback: number;
average_confidence: number;
fallback_answers: number;
};

type DailyActivity = {
date: string;
messages: number;
};

type ActivityPeriod = "daily" | "weekly" | "monthly";

type ActivityItem = {
label: string;
messages: number;
};

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
const router = useRouter();

const [stats, setStats] = useState<Stats | null>(null);
const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [period, setPeriod] =
useState<ActivityPeriod>("daily");

// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {
localStorage.removeItem("admin_token");
router.push("/admin/login");
}

// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboard() {
try {
setLoading(true);
setError("");


  const token = localStorage.getItem("admin_token");

  if (!token) {
    router.push("/admin/login");
    return;
  }

  const [statsResponse, dailyResponse] =
    await Promise.all([
      fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),

      fetch(
        `${API_URL}/admin/analytics/daily?days=180`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    ]);

  // Token expired or invalid
  if (
    statsResponse.status === 401 ||
    dailyResponse.status === 401
  ) {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
    return;
  }

  if (!statsResponse.ok || !dailyResponse.ok) {
    throw new Error(
      "Failed to load dashboard data"
    );
  }

  const statsData = await statsResponse.json();
  const dailyData = await dailyResponse.json();

  if (!Array.isArray(dailyData)) {
    throw new Error(
      "Invalid daily activity response"
    );
  }

  setStats(statsData);
  setDailyActivity(dailyData);
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to load admin dashboard."
  );
} finally {
  setLoading(false);
}


}

// ============================================================
// INITIAL LOAD
// ============================================================

useEffect(() => {
loadDashboard();
}, []);

// ============================================================
// ACTIVITY DATA
// ============================================================

const activityData = useMemo(() => {
if (period === "daily") {
return getLastDays(
dailyActivity,
7
);
}


if (period === "weekly") {
  return getWeeklyActivity(
    dailyActivity,
    8
  );
}

return getMonthlyActivity(
  dailyActivity,
  6
);


}, [dailyActivity, period]);

// ============================================================
// LOADING
// ============================================================

if (loading && !stats) {
return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900"> <div className="flex min-h-[400px] items-center justify-center"> <div className="rounded-xl border border-[#f0c9df] bg-white px-8 py-6 shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]"> <p className="text-gray-500 dark:text-gray-400">
Loading dashboard... </p> </div> </div> </main>
);
}

// ============================================================
// ERROR
// ============================================================

if (error && !stats) {
return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900"> <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30"> <p className="font-medium text-red-600 dark:text-red-400">
{error} </p>


      <button
        onClick={loadDashboard}
        className="mt-4 rounded-lg bg-[#A10D5A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B0F4E]"
      >
        Try Again
      </button>
    </div>
  </main>
);


}

if (!stats) {
return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900"> <p className="text-gray-500 dark:text-gray-400">
No dashboard data available. </p> </main>
);
}

// ============================================================
// DASHBOARD
// ============================================================

return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900">


  {/* HEADER */}

  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Monitor chatbot performance and user activity.
      </p>
    </div>

    <div className="flex gap-3">

      {/* REFRESH */}

      <button
        onClick={loadDashboard}
        disabled={loading}
        className="rounded-xl bg-[#A10D5A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B0F4E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Refreshing..."
          : "Refresh"}
      </button>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="rounded-xl border border-[#A10D5A] bg-white px-5 py-3 text-sm font-semibold text-[#A10D5A] transition hover:bg-[#fff0f7] dark:border-[#C33C78] dark:bg-[#1c1c1c] dark:text-[#F4B8D8] dark:hover:bg-[#2a1722]"
      >
        Logout
      </button>

    </div>

  </div>

  {/* ERROR DURING REFRESH */}

  {error && (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
      <p className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    </div>
  )}

  {/* STATISTICS */}

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

    <StatCard
      title="Total Sessions"
      value={stats.total_sessions}
    />

    <StatCard
      title="Total Questions"
      value={stats.total_questions}
    />

    <StatCard
      title="Total Messages"
      value={stats.total_messages}
    />

    <StatCard
      title="Active Today"
      value={stats.active_today}
    />

    <StatCard
      title="Average Confidence"
      value={`${(
        stats.average_confidence * 100
      ).toFixed(1)}%`}
    />

    <StatCard
      title="Positive Feedback"
      value={stats.positive_feedback}
    />

    <StatCard
      title="Negative Feedback"
      value={stats.negative_feedback}
    />

    <StatCard
      title="Fallback Answers"
      value={stats.fallback_answers}
    />

  </div>

  {/* ACTIVITY ANALYTICS */}

  <section className="mt-8 overflow-hidden rounded-xl border border-[#f0c9df] bg-white shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

    {/* Header */}

    <div className="flex flex-col gap-4 border-b border-[#f0c9df] px-6 py-5 md:flex-row md:items-center md:justify-between dark:border-[#3a3035]">

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Activity Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor chatbot activity over different time periods.
        </p>
      </div>

      {/* Period Selector */}

      <div className="flex rounded-lg border border-[#f0c9df] bg-[#fff8fc] p-1 dark:border-[#4a3540] dark:bg-[#151515]">

        <PeriodButton
          active={period === "daily"}
          onClick={() =>
            setPeriod("daily")
          }
        >
          Daily
        </PeriodButton>

        <PeriodButton
          active={period === "weekly"}
          onClick={() =>
            setPeriod("weekly")
          }
        >
          Weekly
        </PeriodButton>

        <PeriodButton
          active={period === "monthly"}
          onClick={() =>
            setPeriod("monthly")
          }
        >
          Monthly
        </PeriodButton>

      </div>

    </div>

    {/* Activity Content */}

    <div className="p-6">

      {activityData.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-[#151515]">
          <p className="text-gray-500 dark:text-gray-400">
            No activity recorded.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {activityData.map((item) => (

            <div
              key={item.label}
              className="flex items-center gap-4"
            >

              {/* Label */}

              <div className="w-32 shrink-0">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              </div>

              {/* Progress */}

              <div className="flex-1">

                <div className="h-3 overflow-hidden rounded-full bg-[#f8e8f1] dark:bg-[#3a3035]">

                  <div
                    className="h-full rounded-full bg-[#A10D5A] transition-all duration-500"
                    style={{
                      width: `${getActivityPercentage(
                        item.messages,
                        activityData
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* Count */}

              <div className="w-28 text-right">

                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.messages}
                </span>

                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  messages
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>

    {/* Summary */}

    <div className="border-t border-[#f0c9df] bg-[#fffafd] px-6 py-4 dark:border-[#3a3035] dark:bg-[#151515]">

      <p className="text-sm text-gray-500 dark:text-gray-400">

        Showing{" "}

        <span className="font-semibold text-[#A10D5A] dark:text-[#F4B8D8]">
          {period === "daily"
            ? "last 7 days"
            : period === "weekly"
            ? "last 8 weeks"
            : "last 6 months"}
        </span>

      </p>

    </div>

  </section>

</main>

);
}

/* ============================================================
PROTECTED ADMIN PAGE
============================================================ */

export default function ProtectedAdminDashboard() {
return ( <AdminGuard> <AdminDashboard /> </AdminGuard>
);
}

/* ============================================================
STATISTICS CARD
============================================================ */

function StatCard({
title,
value,
}: {
title: string;
value: string | number;
}) {
return ( <div className="rounded-xl border border-[#f0c9df] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#3a3035] dark:bg-[#1c1c1c]">


  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
    {title}
  </p>

  <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
    {value}
  </h2>

</div>


);
}

/* ============================================================
PERIOD BUTTON
============================================================ */

function PeriodButton({
active,
onClick,
children,
}: {
active: boolean;
onClick: () => void;
children: React.ReactNode;
}) {
return (
<button
type="button"
onClick={onClick}
className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#A10D5A] text-white shadow-sm"
          : "text-gray-600 hover:bg-[#fcecf5] hover:text-[#A10D5A] dark:text-gray-300 dark:hover:bg-[#2a1722] dark:hover:text-[#F4B8D8]"
      }`}
>
{children} </button>
);
}

/* ============================================================
LAST N DAYS
============================================================ */

function getLastDays(
activities: DailyActivity[],
days: number
): ActivityItem[] {
const sorted = [...activities].sort(
(a, b) =>
new Date(a.date).getTime() -
new Date(b.date).getTime()
);

return sorted
.slice(-days)
.map((item) => ({
label: formatShortDate(item.date),
messages: item.messages,
}));
}

/* ============================================================
WEEKLY ACTIVITY
============================================================ */

function getWeeklyActivity(
activities: DailyActivity[],
weeks: number
): ActivityItem[] {
const sorted = [...activities].sort(
(a, b) =>
new Date(a.date).getTime() -
new Date(b.date).getTime()
);

const weeklyMap: Record<
string,
number

> = {};

sorted.forEach((item) => {
const date = new Date(
`${item.date}T00:00:00`
);


const weekStart = getWeekStart(date);

const key = formatDateKey(
  weekStart
);

weeklyMap[key] =
  (weeklyMap[key] || 0) +
  item.messages;


});

return Object.entries(weeklyMap)
.sort(([a], [b]) =>
a.localeCompare(b)
)
.slice(-weeks)
.map(([date, messages]) => ({
label: `Week of ${formatShortDate(
        date
      )}`,
messages,
}));
}

/* ============================================================
MONTHLY ACTIVITY
============================================================ */

function getMonthlyActivity(
activities: DailyActivity[],
months: number
): ActivityItem[] {
const sorted = [...activities].sort(
(a, b) =>
new Date(a.date).getTime() -
new Date(b.date).getTime()
);

const monthlyMap: Record<
string,
number

> = {};

sorted.forEach((item) => {
const date = new Date(
`${item.date}T00:00:00`
);


const key =
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

monthlyMap[key] =
  (monthlyMap[key] || 0) +
  item.messages;

});

return Object.entries(monthlyMap)
.sort(([a], [b]) =>
a.localeCompare(b)
)
.slice(-months)
.map(([month, messages]) => ({
label: formatMonth(month),
messages,
}));
}

/* ============================================================
WEEK START
============================================================ */

function getWeekStart(date: Date) {
const result = new Date(date);

const day = result.getDay();

const difference =
day === 0 ? -6 : 1 - day;

result.setDate(
result.getDate() + difference
);

return result;
}

/* ============================================================
DATE KEY
============================================================ */

function formatDateKey(date: Date) {
return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

/* ============================================================
SHORT DATE
============================================================ */

function formatShortDate(
dateString: string
) {
const date = new Date(
`${dateString}T00:00:00`
);

return date.toLocaleDateString(
undefined,
{
month: "short",
day: "numeric",
}
);
}

/* ============================================================
MONTH FORMAT
============================================================ */

function formatMonth(month: string) {
const date = new Date(
`${month}-01T00:00:00`
);

return date.toLocaleDateString(
undefined,
{
month: "short",
year: "numeric",
}
);
}

/* ============================================================
ACTIVITY PERCENTAGE
============================================================ */

function getActivityPercentage(
messages: number,
activities: ActivityItem[]
) {
const maxMessages = Math.max(
...activities.map(
(item) => item.messages
),
1
);

return Math.max(
(messages / maxMessages) * 100,
5
);
}
