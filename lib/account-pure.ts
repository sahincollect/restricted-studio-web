/**
 * Pure customer display-name normalization and recovery helpers.
 * Safe for both client/server bundles and isolated node --test execution.
 */

export function isGenericOrPollutedCustomerName(
  value?: string | null,
  email?: string | null
): boolean {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return true;
  if (/^(müşteri|musteri|üye|uye|client)$/i.test(trimmed)) return true;
  if (/^restricted$/i.test(trimmed) && (!email || !/^restricted@/i.test(email.trim()))) {
    return true;
  }
  return false;
}

export function cleanCustomerNameCandidate(
  value?: string | null,
  email?: string | null
): string {
  if (isGenericOrPollutedCustomerName(value, email)) return '';
  return String(value).trim().slice(0, 48);
}

export function resolveCustomerDisplayName(params: {
  profileDisplayName?: string | null;
  userMetadata?: Record<string, unknown> | null;
  sessionName?: string | null;
  email?: string | null;
}): string {
  const um = (params.userMetadata || {}) as Record<string, unknown>;
  const customClaims =
    um.custom_claims && typeof um.custom_claims === 'object'
      ? (um.custom_claims as Record<string, unknown>)
      : {};

  const candidates: Array<string> = [
    cleanCustomerNameCandidate(params.profileDisplayName, params.email),
    cleanCustomerNameCandidate(
      typeof um.rs_display_name === 'string' ? um.rs_display_name : '',
      params.email
    ),
    cleanCustomerNameCandidate(
      typeof customClaims.global_name === 'string' ? customClaims.global_name : '',
      params.email
    ),
    cleanCustomerNameCandidate(
      typeof um.full_name === 'string' ? um.full_name : '',
      params.email
    ),
    cleanCustomerNameCandidate(typeof um.name === 'string' ? um.name : '', params.email),
    cleanCustomerNameCandidate(
      typeof um.username === 'string' ? um.username : '',
      params.email
    ),
    cleanCustomerNameCandidate(params.sessionName, params.email),
  ];

  for (const cand of candidates) {
    if (cand) return cand;
  }

  if (params.email && params.email.includes('@')) {
    const local = params.email.split('@')[0]?.trim();
    if (local) return local.slice(0, 48);
  }

  return 'Üye';
}
