import { escapeHtml, GAIN_SIGNATURE_HTML, GAIN_SIGNATURE_TEXT } from "@/lib/email-shared";

/**
 * Copy and rendering for the new-member onboarding drip sequence (6 emails).
 * Timings live in the cron (src/app/api/cron/onboarding-drip/route.ts); this
 * module owns only what each email says and how it is rendered.
 *
 * Hallum's voice: warm, plain, encouraging, first person. British English,
 * no em-dashes. Source drafts: AI for SMBs/onboarding-flow/onboarding-emails.md.
 */

export const MOBILITY_GUIDE_URL =
  "https://www.gainstrengththerapy.com/media/at-home-mobility-guide.pdf";
export const NUTRITION_GUIDE_URL =
  "https://www.gainstrengththerapy.com/media/gain-nutrition-guide.pdf";

/** Lowest emailIndex (1) through highest (6); used to validate callers. */
export const DRIP_EMAIL_COUNT = 6;

type DripContent = { subject: string; html: string; text: string };

function ctaButton(href: string, label: string): string {
  return `<p style="margin: 24px 0;"><a href="${href}" style="display: inline-block; background: #FC832C; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">${escapeHtml(
    label,
  )}</a></p>`;
}

/** Wrap an email body in the standard shell and append Hallum's signature. */
function wrapHtml(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; line-height: 1.7; max-width: 540px; margin: 0 auto; padding: 24px;">
<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(preheader)}</div>
${bodyHtml}
${GAIN_SIGNATURE_HTML}
</body>
</html>`;
}

/** Join text-email lines and append the plain-text signature. */
function wrapText(lines: string[]): string {
  return [...lines, "", GAIN_SIGNATURE_TEXT].join("\n");
}

/**
 * Build the subject, HTML and plain-text for a given drip email.
 * `firstName` is the member's first name; `emailIndex` is 1-6.
 */
export function buildDripEmailContent(firstName: string, emailIndex: number): DripContent {
  const name = firstName.trim() || "there";
  const safeName = escapeHtml(name);

  switch (emailIndex) {
    case 1:
      return {
        subject: `Welcome to Gain, ${name}`,
        html: wrapHtml(
          "Your next step is booking your induction. Here is everything you need.",
          `<p>Hi ${safeName},</p>
<p>You are in. Welcome to Gain.</p>
<p>Before your first session, we will do a short induction, just the two of us, to set up your programme properly. It takes 20 to 30 minutes and happens at the studio before you join your first group session. It is where we establish your starting point, pick your tracking exercise, and make sure I know everything I need to know about your body.</p>
<p>To book your induction slot, head to your TeamUp account or just reply to this email and I will sort it.</p>
${ctaButton("mailto:hallum@gainstrengththerapy.com?subject=Booking%20my%20induction", "Book your induction")}
<p style="font-weight: 700; font-size: 15px; margin-top: 28px;">A few things worth knowing as you get started</p>
<p>The programme runs in groups of up to six. You will always have the same coach in the room, exercises adapted to you, and a measured result to aim for. Most people do two sessions a week, though one or three are also fine and we will agree what fits.</p>
<p>There are no contracts. After your programme ends, members move to a monthly rolling membership if they want to continue, no automatic sign-up, no pressure.</p>
<p>I will send you a short note in the next couple of days with exactly what to expect at your induction and how your first session runs. No need to prepare anything; just reply to this email if something about your health or your history is worth me knowing before we meet.</p>
<p>Speak soon,<br>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "You are in. Welcome to Gain.",
          "",
          "Before your first session, we will do a short induction, just the two of us, to set up your programme properly. It takes 20 to 30 minutes and happens at the studio before you join your first group session. It is where we establish your starting point, pick your tracking exercise, and make sure I know everything I need to know about your body.",
          "",
          "To book your induction slot, head to your TeamUp account or just reply to this email and I will sort it.",
          "",
          "A few things worth knowing as you get started:",
          "",
          "The programme runs in groups of up to six. You will always have the same coach in the room, exercises adapted to you, and a measured result to aim for. Most people do two sessions a week, though one or three are also fine and we will agree what fits.",
          "",
          "There are no contracts. After your programme ends, members move to a monthly rolling membership if they want to continue, no automatic sign-up, no pressure.",
          "",
          "I will send you a short note in the next couple of days with exactly what to expect at your induction and how your first session runs. No need to prepare anything; just reply to this email if something about your health or your history is worth me knowing before we meet.",
          "",
          "Speak soon,",
          "Hallum",
        ]),
      };

    case 2:
      return {
        subject: "Your Gain induction: what to expect on the day",
        html: wrapHtml(
          "A 20 to 30 minute one-to-one with me, then your first group session. Here is exactly how it runs.",
          `<p>Hi ${safeName},</p>
<p>Your induction is coming up and I wanted to give you a clear picture of what we will actually do during that 20 to 30 minutes, so you arrive feeling prepared rather than uncertain.</p>
<p style="font-weight: 700; font-size: 15px;">Your induction, in five parts</p>
<p>The induction is one-to-one, no group around you. It works through these five things in order:</p>
<ol style="padding-left: 20px;">
<li style="margin-bottom: 10px;"><strong>Movement assessment.</strong> I will walk you through a handful of basic movements: a squat, a hinge, a press, a pull, a step. Light or unloaded. I am watching how you move, not how strong you are. If anything is uncomfortable, or if you have a history with a particular joint, that comes up here and I plan around it.</li>
<li style="margin-bottom: 10px;"><strong>Choose your tracking exercise.</strong> We pick one exercise to measure your progress across the programme. The usual choices are the goblet squat, the trap-bar deadlift, the press-up, the dumbbell row, or a single-leg balance. The right pick depends on how you move today and what you want from the programme. You do not need to decide in advance.</li>
<li style="margin-bottom: 10px;"><strong>Establish your baseline.</strong> We test your starting point on that exercise. A real number, not a vague impression. That number goes on the whiteboard.</li>
<li style="margin-bottom: 10px;"><strong>Whiteboard setup.</strong> Your name and your baseline go up. Six weeks later (or twelve), the new number sits next to the first. That is your progress in plain figures.</li>
<li style="margin-bottom: 10px;"><strong>Programme walkthrough.</strong> I take you through what your week looks like: which sessions you are booked into, what the warm-up and main blocks contain, when we re-test. You leave with a clear picture of the next month or three, not a vague "see you next week".</li>
</ol>
<p style="font-weight: 700; font-size: 15px;">What happens straight after</p>
<p>You join your first group session immediately after the induction, on the same visit. No second appointment. I will introduce you to the group and give you a bit of extra attention in those first few sessions.</p>
<p style="font-weight: 700; font-size: 15px;">How a group session runs</p>
<p>Sessions are coached end to end, four to six people in the room. The shape is consistent: a warm-up led by me, a short block of your individual exercises (where your tracking exercise sits), two group blocks with weights scaled to each person, and a short finisher. Same exercises, different loads, different paces. Form before load, every time.</p>
<p style="font-weight: 700; font-size: 15px;">Before you arrive</p>
<ul style="padding-left: 20px;">
<li style="margin-bottom: 8px;">Arrive five minutes early. Enough time to find the door, change your shoes, and start without rushing.</li>
<li style="margin-bottom: 8px;">Wear something you can move in. Trainers with a reasonably flat sole work best. Layers in colder months. Please no jeans.</li>
<li style="margin-bottom: 8px;">Bring water. All equipment is provided.</li>
<li style="margin-bottom: 8px;">Address: Gain Strength Therapy, Dursley Road, Eastbourne BN22 8DJ.</li>
<li style="margin-bottom: 8px;">If the studio door is closed when you arrive, knock or text me on 01323 370022. It sometimes pulls shut.</li>
</ul>
<p>If there is anything about your body, an injury, a condition, something a physio or doctor has mentioned, just reply to this email. It does not have to be a long message. It means I can plan your induction properly and you do not have to bring it up cold in the room. If there is nothing to flag, you do not need to reply.</p>
<p>See you soon,<br>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "Your induction is coming up and I wanted to give you a clear picture of what we will actually do during that 20 to 30 minutes, so you arrive feeling prepared rather than uncertain.",
          "",
          "Your induction, in five parts:",
          "",
          "1. Movement assessment. I will walk you through a handful of basic movements: a squat, a hinge, a press, a pull, a step. Light or unloaded. I am watching how you move, not how strong you are.",
          "2. Choose your tracking exercise. We pick one exercise to measure your progress. The usual choices are the goblet squat, the trap-bar deadlift, the press-up, the dumbbell row, or a single-leg balance. You do not need to decide in advance.",
          "3. Establish your baseline. We test your starting point on that exercise. A real number, not a vague impression.",
          "4. Whiteboard setup. Your name and your baseline go up. Six weeks later, the new number sits next to the first.",
          "5. Programme walkthrough. I take you through what your week looks like and when we re-test.",
          "",
          "What happens straight after: you join your first group session immediately after the induction, on the same visit. No second appointment.",
          "",
          "How a group session runs: coached end to end, four to six people in the room. A warm-up led by me, a short block of your individual exercises, two group blocks scaled to each person, and a short finisher. Form before load, every time.",
          "",
          "Before you arrive:",
          "- Arrive five minutes early.",
          "- Wear something you can move in. Flat-soled trainers work best. Please no jeans.",
          "- Bring water. All equipment is provided.",
          "- Address: Gain Strength Therapy, Dursley Road, Eastbourne BN22 8DJ.",
          "- If the studio door is closed, knock or text me on 01323 370022.",
          "",
          "If there is anything about your body worth me knowing, just reply to this email. If there is nothing to flag, you do not need to reply.",
          "",
          "See you soon,",
          "Hallum",
        ]),
      };

    case 3:
      return {
        subject: "Something to use between sessions",
        html: wrapHtml(
          "A short mobility guide I put together for rest days. Takes 10 to 15 minutes.",
          `<p>Hi ${safeName},</p>
<p>Now that you have had your induction and your first session, I wanted to send you something for the days in between.</p>
<p>A lot of the progress from strength training happens during recovery, not during the sessions themselves. Mobility work on your rest days keeps the tissue moving, reduces soreness, and means you arrive at your next session feeling ready rather than stiff.</p>
<p>I have put together a short at-home guide for exactly this. It covers the key movements that complement the work we do in the gym: nothing complicated, no equipment needed, 10 to 15 minutes.</p>
${ctaButton(MOBILITY_GUIDE_URL, "Open the At-Home Mobility Guide")}
<p>Try it on a rest day this week and let me know if anything feels off for your body. I can tweak the routine based on what we found at your induction.</p>
<p>Any questions, reply here or text me.</p>
<p>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "Now that you have had your induction and your first session, I wanted to send you something for the days in between.",
          "",
          "A lot of the progress from strength training happens during recovery, not during the sessions themselves. Mobility work on your rest days keeps the tissue moving, reduces soreness, and means you arrive at your next session feeling ready rather than stiff.",
          "",
          "I have put together a short at-home guide for exactly this. It covers the key movements that complement the work we do in the gym: nothing complicated, no equipment needed, 10 to 15 minutes.",
          "",
          `Open the At-Home Mobility Guide: ${MOBILITY_GUIDE_URL}`,
          "",
          "Try it on a rest day this week and let me know if anything feels off for your body. I can tweak the routine based on what we found at your induction.",
          "",
          "Any questions, reply here or text me.",
          "",
          "Hallum",
        ]),
      };

    case 4:
      return {
        subject: "How's the first week going?",
        html: wrapHtml(
          "A quick note to see how you are finding it so far.",
          `<p>Hi ${safeName},</p>
<p>Just a quick note at the end of your first week.</p>
<p>I hope the sessions have felt manageable rather than overwhelming. The first week is always about getting familiar: familiar with the movements, familiar with the group, familiar with how your body responds. The load comes later.</p>
<p>A couple of things worth knowing at this stage:</p>
<p><strong>Soreness is normal, pain is not.</strong> Some muscle soreness in the day or two after a session is completely normal and usually peaks around 48 hours. If anything feels sharp, persistent, or different from ordinary tiredness, let me know before your next session. Do not push through things that feel wrong.</p>
<p><strong>You do not need to be perfect.</strong> The members who make the most progress are not the ones who never miss a session. They are the ones who keep coming back. If life gets in the way once, it matters a lot less than you think.</p>
<p>Is there anything you want me to know before your next session? Any movement that felt uncertain, anything you want more time on? Just reply here.</p>
<p>See you soon,<br>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "Just a quick note at the end of your first week.",
          "",
          "I hope the sessions have felt manageable rather than overwhelming. The first week is always about getting familiar: familiar with the movements, familiar with the group, familiar with how your body responds. The load comes later.",
          "",
          "A couple of things worth knowing at this stage:",
          "",
          "Soreness is normal, pain is not. Some muscle soreness in the day or two after a session is completely normal and usually peaks around 48 hours. If anything feels sharp, persistent, or different from ordinary tiredness, let me know before your next session.",
          "",
          "You do not need to be perfect. The members who make the most progress are the ones who keep coming back. If life gets in the way once, it matters a lot less than you think.",
          "",
          "Is there anything you want me to know before your next session? Just reply here.",
          "",
          "See you soon,",
          "Hallum",
        ]),
      };

    case 5:
      return {
        subject: "The Gain approach to eating around training",
        html: wrapHtml(
          "Two weeks in, here is the other side of the equation.",
          `<p>Hi ${safeName},</p>
<p>Two weeks in. Your body is starting to adapt to the training, and this is a good moment to think about the other side of the equation: what you eat around it.</p>
<p>Nutrition is one of those topics that generates a lot of noise and very little useful signal. I am not going to give you a meal plan or tell you to cut out food groups. What I will say is that there are a few simple things that make a genuine difference to how you feel in sessions and how quickly you recover, and they are far less complicated than most people expect.</p>
<p>I have put together a guide that covers the basics of eating around strength training, written for exactly the kind of training we do at Gain. It is not a diet plan. It is context and a handful of practical habits.</p>
${ctaButton(NUTRITION_GUIDE_URL, "Open the Gain Nutrition Guide")}
<p>Have a read when you get a chance. If anything raises questions about your own situation, specifically if you are managing a condition or a medication that affects how you eat, reply here and we can talk it through.</p>
<p>Keep going,<br>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "Two weeks in. Your body is starting to adapt to the training, and this is a good moment to think about the other side of the equation: what you eat around it.",
          "",
          "Nutrition is one of those topics that generates a lot of noise and very little useful signal. I am not going to give you a meal plan or tell you to cut out food groups. What I will say is that there are a few simple things that make a genuine difference to how you feel in sessions and how quickly you recover.",
          "",
          "I have put together a guide that covers the basics of eating around strength training, written for exactly the kind of training we do at Gain. It is not a diet plan. It is context and a handful of practical habits.",
          "",
          `Open the Gain Nutrition Guide: ${NUTRITION_GUIDE_URL}`,
          "",
          "Have a read when you get a chance. If anything raises questions about your own situation, specifically if you are managing a condition or a medication that affects how you eat, reply here and we can talk it through.",
          "",
          "Keep going,",
          "Hallum",
        ]),
      };

    case 6:
      return {
        subject: `Three weeks in, ${name}`,
        html: wrapHtml(
          "A quick check-in at the halfway point of your first month.",
          `<p>Hi ${safeName},</p>
<p>Three weeks in. I wanted to check in properly.</p>
<p>This is the point in a programme where people often stop noticing the progress because it has become the new normal. The movements that felt unfamiliar in week one are routine now. That is not a plateau, that is adaptation, and it is exactly what is supposed to happen.</p>
<p><strong>A question worth thinking about.</strong> Without looking at a number, do you feel stronger than you did on your first day? Not fitter, not lighter, just stronger: more stable, more capable, more in control of your body? Most people do by now, even if they cannot quantify it. We will re-test the number at the end of the programme, and the gap tends to be more satisfying than people expect.</p>
<p><strong>What happens after your programme ends.</strong> Most members move to a monthly rolling membership. Two sessions a week is the most common choice. There are no contracts and no automatic rollovers; we have a conversation about it at the final session. I mention it now so it does not come as a surprise.</p>
<p>If anything about the programme is not working for you, this is a good moment to tell me. Not at the end, when it is too late to adjust. Now. Reply here, or bring it up before your next session.</p>
<p>Well done for getting this far.<br>Hallum</p>`,
        ),
        text: wrapText([
          `Hi ${name},`,
          "",
          "Three weeks in. I wanted to check in properly.",
          "",
          "This is the point in a programme where people often stop noticing the progress because it has become the new normal. The movements that felt unfamiliar in week one are routine now. That is not a plateau, that is adaptation, and it is exactly what is supposed to happen.",
          "",
          "A question worth thinking about. Without looking at a number, do you feel stronger than you did on your first day? Not fitter, not lighter, just stronger: more stable, more capable, more in control of your body? Most people do by now, even if they cannot quantify it.",
          "",
          "What happens after your programme ends. Most members move to a monthly rolling membership. Two sessions a week is the most common choice. There are no contracts and no automatic rollovers; we have a conversation about it at the final session.",
          "",
          "If anything about the programme is not working for you, this is a good moment to tell me. Not at the end, when it is too late to adjust. Now. Reply here, or bring it up before your next session.",
          "",
          "Well done for getting this far.",
          "Hallum",
        ]),
      };

    default:
      throw new Error(`Unknown onboarding email index: ${emailIndex}`);
  }
}
