function getOrigin(event) {
  const protocol = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers["x-forwarded-host"] || event.headers.host;
  return `${protocol}://${host}`;
}

export async function handler(event) {
  const origin = getOrigin(event);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300"
    },
    body: JSON.stringify({
      url: origin,
      name: "TipJar OP",
      iconUrl: `${origin}/op-mark.svg`,
      termsOfUseUrl: `${origin}/`,
      privacyPolicyUrl: `${origin}/`
    })
  };
}
