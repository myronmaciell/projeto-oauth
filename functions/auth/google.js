export async function onRequest(context) {
  const { env } = context;

  return new Response(
    JSON.stringify({
      client_id: env.GOOGLE_CLIENT_ID,
      base_url: env.PUBLIC_BASE_URL
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}