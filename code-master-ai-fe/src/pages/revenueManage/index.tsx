import RevenueStatisticsSection from "../../components/statistics/RevenueStatisticsSection";
import OrderStatisticsSection from "../../components/statistics/OrderStatisticsSection";

export default function RevenueStatisticsPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <RevenueStatisticsSection />
        <OrderStatisticsSection />
      </div>
    </div>
  );
}
