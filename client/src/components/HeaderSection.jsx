export default function HeaderSection({ user, insights, serviceType }) {

  // ✅ get correct data based on tab
  const current =
    serviceType === "food"
      ? insights?.food
      : serviceType === "grocery"
      ? insights?.grocery
      : insights?.ride;

  return (
    <div className="mb-6">

      {/* 👋 Welcome */}
      {user && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-green-500/10 text-green-300 border border-green-400/20">
          👋 Welcome back, <strong>{user.name}</strong>
        </div>
      )}

      {/* 📊 Insights */}
      {insights && (
        <div className="p-4 rounded-xl text-sm border bg-blue-500/8 border-blue-400/20 text-blue-200">

          <div className="font-semibold mb-2">
            📊 {serviceType === "food" && "Food Insights"}
            {serviceType === "grocery" && "Grocery Insights"}
            {serviceType === "ride" && "Ride Insights"}
          </div>

          <div className="grid grid-cols-3 gap-2">

            {/* 🍔 FOOD */}
            {serviceType === "food" && (
              <>
                <Box label="Searches" value={current?.total || 0} />
                <Box label="Top Food" value={current?.favouriteFood || "—"} />
                <Box label="Top City" value={current?.favouriteCity || "—"} />
              </>
            )}

            {/* 🛒 GROCERY */}
            {serviceType === "grocery" && (
              <>
                <Box label="Searches" value={current?.total || 0} />
                <Box label="Top Item" value={current?.favouriteItem || "—"} />
                <Box label="Top City" value={current?.favouriteCity || "—"} />
              </>
            )}

            {/* 🚗 RIDE */}
            {serviceType === "ride" && (
              <>
                <Box label="Rides" value={current?.total || 0} />
                <Box label="Best Platform" value={current?.favouritePlatform || "—"} />
                <Box label="Avg Price" value={`₹${current?.avgRidePrice || 0}`} />
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ THIS WAS MISSING — ADD THIS BELOW */
function Box({ label, value }) {
  return (
    <div className="text-center py-2 rounded-lg bg-white/5">
      <div className="font-bold text-sm">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}