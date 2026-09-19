export async function onRequest(context) {
  const { request, env } = context;

  // Pega o "code" enviado pelo Google
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Verifica se o Google retornou algum erro
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`Erro no login com Google: ${error}`, {
      status: 400
    });
  }

  // Verifica se recebeu o código
  if (!code) {
    return new Response("Código de autorização não encontrado.", {
      status: 400
    });
  }

  // URL para a qual o Google retorna o usuário
  const redirectUri =
    `${env.PUBLIC_BASE_URL}/auth/google-callback`;

  // Troca o código pelo token
  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body: new URLSearchParams({
        code: code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    }
  );

  // Verifica se o Google aceitou a troca
  if (!tokenResponse.ok) {
    return new Response(
      "Não foi possível obter o token do Google.",
      {
        status: 400
      }
    );
  }

  // Pega a resposta do Google
  const tokens = await tokenResponse.json();

  // Retorna o resultado apenas para teste
  return new Response(
    JSON.stringify(tokens),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}