/**
 * Shared email building blocks used across the transactional and lifecycle
 * emails (lead confirmation, consultation reminder, onboarding drip).
 *
 * Keeping the signature in one place means a brand or contact-detail change is
 * made once and every customer-facing email picks it up. The owner-notification
 * email is intentionally excluded: it is an internal alert, not customer-facing.
 *
 * Canonical source for the signature markup: AI for SMBs/gain-email-signature.html.
 */

/** Escape user-supplied text before interpolating it into an HTML email body. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Hallum's full HTML email signature: logo, name, role, contact details and
 * social links, as a table for email-client compatibility. The logo is loaded
 * from the live site so it renders identically for every recipient.
 */
export const GAIN_SIGNATURE_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation"
       style="border-collapse:collapse;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#0a0a0a;margin-top:8px;">
  <tr>
    <td valign="middle" style="padding:0 22px 0 0;">
      <img src="https://www.gainstrengththerapy.com/media/logo-light.png"
           width="140" height="45" alt="Gain Strength Therapy"
           style="display:block;border:0;outline:none;width:140px;height:45px;" />
    </td>
    <td valign="middle" style="padding:0;width:1px;background:#0a0a0a;font-size:1px;line-height:1px;">&nbsp;</td>
    <td valign="middle" style="padding:0 0 0 22px;">
      <div style="font-size:17px;line-height:1.2;font-weight:700;color:#0a0a0a;letter-spacing:-0.01em;">
        Hallum Cousins<span style="font-weight:400;color:#6a6660;">, MSc Sport Physiology</span>
      </div>
      <div style="font-size:13px;line-height:1.2;font-weight:600;color:#FC832C;letter-spacing:0.04em;text-transform:uppercase;margin-top:6px;">
        Founder &amp; Head Coach &middot; Gain Strength Therapy
      </div>
      <div style="font-size:14px;line-height:1.55;color:#3a3a36;margin-top:10px;">
        <a href="tel:+441323370022" style="color:#3a3a36;text-decoration:none;">+44 1323 370022</a> &nbsp;&middot;&nbsp;
        <a href="mailto:hallum@gainstrengththerapy.com" style="color:#3a3a36;text-decoration:none;">hallum@gainstrengththerapy.com</a><br />
        <a href="https://www.gainstrengththerapy.com" target="_blank" rel="noopener noreferrer" style="color:#3a3a36;text-decoration:none;">gainstrengththerapy.com</a>
        &nbsp;&middot;&nbsp; Dursley Rd, Eastbourne BN22 8DJ
      </div>
      <div style="font-size:13px;line-height:1.2;color:#6a6660;margin-top:8px;">
        <a href="https://www.instagram.com/gainuk_/" target="_blank" rel="noopener noreferrer" style="color:#0a0a0a;text-decoration:none;font-weight:600;">Instagram</a>
        <span style="color:#0a0a0a;">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
        <a href="https://www.facebook.com/p/Gain-Strength-Therapy-61555544315873/" target="_blank" rel="noopener noreferrer" style="color:#0a0a0a;text-decoration:none;font-weight:600;">Facebook</a>
      </div>
    </td>
  </tr>
</table>`;

/** Plain-text equivalent of the signature, for the `text` part of each email. */
export const GAIN_SIGNATURE_TEXT = [
  "Hallum Cousins, MSc Sport Physiology",
  "Founder & Head Coach | Gain Strength Therapy",
  "+44 1323 370022 | hallum@gainstrengththerapy.com",
  "gainstrengththerapy.com | Dursley Rd, Eastbourne BN22 8DJ",
  "Instagram: https://www.instagram.com/gainuk_/",
  "Facebook: https://www.facebook.com/p/Gain-Strength-Therapy-61555544315873/",
].join("\n");
