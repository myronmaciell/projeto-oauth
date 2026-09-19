export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);

  // Código enviado pelo Google
  const code = url.searchParams.get("code");

  // Verifica se o Google retornou algum erro
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`Erro no login com Google: ${error}`, {
      status: 400
    });
  }

  if (!code) {
    return new Response(
      "Código de autorização não encontrado.",
      {
        status: 400
      }
    );
  }

  // URL de retorno cadastrada no Google
  const redirectUri =
    `${env.PUBLIC_BASE_URL}/auth/google-callback`;

  // Troca o código recebido pelo token
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

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();

    return new Response(
      `Erro ao obter token do Google: ${errorText}`,
      {
        status: 400
      }
    );
  }

  const tokens = await tokenResponse.json();

  // Busca os dados do usuário
  const userResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    }
  );

  if (!userResponse.ok) {
    return new Response(
      "Não foi possível obter os dados do usuário.",
      {
        status: 400
      }
    );
  }

  const user = await userResponse.json();

  // Retorno temporário para testar
  return new Response(
    JSON.stringify({
      message: "Login realizado com sucesso!",
      user: user
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}