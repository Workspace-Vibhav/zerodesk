import { STATUS_OPTIONS } from "@/lib/constants";

type Variation = "desktop" | "mobile";

interface Screen {
  desktopStatus: string;
  mobileStatus: string;
  desktopDevVerified: boolean;
  mobileDevVerified: boolean;
}

interface StatsBarProps {
  screens: Screen[];
  variation: Variation;
}

export function StatsBar({ screens, variation }: StatsBarProps) {
  const total = screens.length;

  const getStatus = (screen: Screen) => {
    return variation === "desktop" ? screen.desktopStatus : screen.mobileStatus;
  };

  const counts = STATUS_OPTIONS.reduce((acc, option) => {
    acc[option.value] = screens.filter((s) => getStatus(s) === option.value).length;
    return acc;
  }, {} as Record<string, number>);

  const donePercent = total > 0 ? Math.round((counts.DONE / total) * 100) : 0;

  // Count dev verified screens
  const doneScreens = screens.filter((s) => getStatus(s) === "DONE");
  const devVerifiedCount = doneScreens.filter((s) =>
    variation === "desktop" ? s.desktopDevVerified : s.mobileDevVerified
  ).length;

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Total Screens</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{counts.NOT_STARTED}</div>
          <div className="text-sm text-muted-foreground">Not Started</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{counts.IN_PROGRESS}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{counts.DONE}</div>
          <div className="text-sm text-muted-foreground">Done</div>
          {counts.DONE > 0 && (
            <div className="text-xs text-green-700 mt-1">
              Dev: {devVerifiedCount}/{counts.DONE}
            </div>
          )}
        </div>

        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{counts.NEEDS_REVIEW}</div>
          <div className="text-sm text-muted-foreground">Needs Review</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${donePercent}%` }}
          />
        </div>
        <span className="text-sm font-medium text-green-600">{donePercent}%</span>
      </div>
    </div>
  );
}
