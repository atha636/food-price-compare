export default function VerificationFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-500">
          Verification Failed ❌
        </h1>

        <p className="mt-3 text-gray-500">
          The verification link is invalid or expired.
        </p>

        <a
          href="/"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}