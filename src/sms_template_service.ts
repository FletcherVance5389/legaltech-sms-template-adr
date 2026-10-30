import { z } from "zod";

export const matterIntake = z.object({
  matterId: z.string().min(1),
  phone: z.string().min(7),
  clientName: z.string().min(1),
  deadline: z.string().min(1)
});

export type MatterIntake = z.infer<typeof matterIntake>;

type ApprovedTemplate = {
  signature: string;
  render: (matter: MatterIntake) => string;
};

const templates: Record<string, ApprovedTemplate> = {
  intake: { signature: "LegalDesk", render: (m) => `Hi ${m.clientName}, we received matter ${m.matterId}.` },
  signed_document: { signature: "LegalDesk", render: (m) => `Your signed document for ${m.matterId} is ready.` },
  deadline_follow_up: { signature: "LegalDesk", render: (m) => `Reminder: ${m.matterId} has a deadline on ${m.deadline}.` }
};

export function buildApprovedMessage(kind: keyof typeof templates, input: unknown) {
  const matter = matterIntake.parse(input);
  const template = templates[kind];
  return { to: matter.phone, content: `${template.render(matter)} ${template.signature}` };
}

export function chooseTemplate(matter: MatterIntake): keyof typeof templates {
  return matter.deadline ? "deadline_follow_up" : "intake";
}
