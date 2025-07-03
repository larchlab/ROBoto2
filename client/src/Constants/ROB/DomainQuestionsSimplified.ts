const q_1_1 = `Was the allocation sequence random? `;

const q_1_2 = `Was the allocation sequence concealed until participants were enrolled and assigned to interventions?`;

const q_1_3 = `Did baseline differences between intervention groups suggest a problem with the randomization process?`;

const q_2_1 = `Were participants aware of their assigned intervention during the trial?`;

const q_2_2 = `Were carers and people delivering the interventions aware of participants' assigned intervention during the trial?`;

const q_2_3 = ` Were there deviations from the intended intervention that arose because of the trial context?`;

const q_2_4 = `Were these deviations likely to have affected the outcome?`;

const q_2_5 = `Were these deviations from intended intervention balanced between groups?`;

const q_2_6 = `Was an appropriate analysis used to estimate the effect of assignment to intervention?`;

const q_2_7 = `Was there potential for a substantial impact (on the result) of the failure to analyse participants in
the group to which they were randomized?`;

const q_3_1 = `Were data for this outcome available for all, o rnearly all, participants randomized?`;

const q_3_2 = `Is there evidence that the result was not biased by missing outcome data?`;

const q_3_3 = `Could missingness in the outcome depend on its true value?`;

const q_3_4 = `Is it likely that missingness in the outcome depended on its true value?`;

const q_4_1 = `Was the method of measuring the outcome inappropriate?`;

const q_4_2 = `Could measurement or ascertainment of the outcome have differed between intervention groups?`;

const q_4_3 = `Were outcome assessors aware of the intervention received by study participants?`;

const q_4_4 = `Could assessment of the outcome have been influenced by knowledge of intervention received?`;

const q_4_5 = `Is it likely that assessment of the outcome was influenced by knowledge of intervention received?`;

const q_5_1 = `Were the data that produced this result analysed in accordance with a pre-specified analysis plan that was finalized
before unblinded outcome data were available or analysis?`;

const q_5_2 = `Is the numerical result being assessed likely to have been selected, on the basis of the results, from
multiple eligible outcome measurements (e.g. scales, definitions, time points) within the outcome domain?`;

const q_5_3 = `Is the numerical result being assessed likely to have been selected, on the basis of the results,
from multiple eligible analyses of the data?`;

const domain_1_questions = [q_1_1, q_1_2, q_1_3];
const domain_2_questions = [q_2_1, q_2_2, q_2_3, q_2_4, q_2_5, q_2_6, q_2_7];
const domain_3_questions = [q_3_1, q_3_2, q_3_3, q_3_4];
const domain_4_questions = [q_4_1, q_4_2, q_4_3, q_4_4, q_4_5];
const domain_5_questions = [q_5_1, q_5_2, q_5_3];

export const question_dict_simplified = {
	domain_1_questions: domain_1_questions,
	domain_2_questions: domain_2_questions,
	domain_3_questions: domain_3_questions,
	domain_4_questions: domain_4_questions,
	domain_5_questions: domain_5_questions,
};
