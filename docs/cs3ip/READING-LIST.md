# Reading list (starting set)

Each entry below has been checked to exist with these details. Read each one yourself before citing it,
and get the published version through Aston library (Findit@Aston / ACM Digital Library) where possible.

## Closest prior systems: LLM tutors that avoid giving solutions

1. **Liffiton, M., Sheese, B., Savelka, J. and Denny, P. (2023).** CodeHelp: Using Large Language Models with
   Guardrails for Scalable Support in Programming Classes. *Koli Calling '23.* https://doi.org/10.1145/3631802.3631830
   · preprint https://arxiv.org/abs/2308.06921
   → Closest to this project: LLM help with guardrails against revealing solutions. Read its guardrail design closely.
2. **Sheese, B., Liffiton, M., Savelka, J. and Denny, P. (2024).** Patterns of Student Help-Seeking When Using a
   Large Language Model-Powered Programming Assistant. https://arxiv.org/abs/2310.16984
   → What students actually ask for; useful for exercise and hint design.
3. **Liu, R., Zenke, C., Liu, C., Holmes, A., Thornton, P. and Malan, D.J. (2024).** Teaching CS50 with AI: Leveraging
   Generative Artificial Intelligence in Computer Science Education. *SIGCSE 2024*, pp. 750–756.
   https://doi.org/10.1145/3626252.3630938
   → The CS50 Duck: deployed at scale with "pedagogical guardrails".
4. **Kazemitabaar, M. et al. (2024).** CodeAid: Evaluating a Classroom Deployment of an LLM-based Programming
   Assistant that Balances Student and Educator Needs. *CHI '24.* https://doi.org/10.1145/3613904.3642773
   · https://arxiv.org/abs/2401.11314
   → 700-student deployment; four design considerations; educator concerns about incorrect feedback.

## Hint quality and validation

5. **Phung, T. et al. (2024).** Automating Human Tutor-Style Programming Feedback: Leveraging GPT-4 Tutor Model for
   Hint Generation and GPT-3.5 Student Model for Hint Validation. *LAK '24*, pp. 12–23.
   https://doi.org/10.1145/3636555.3636846 · https://arxiv.org/abs/2310.03780
   → Validates hints with a second model before showing them. Direct comparison point for the leak guard.

## Motivation: novices and code-generating AI

6. **Prather, J. et al. (2023).** "It's Weird That it Knows What I Want": Usability and Interactions with Copilot
   for Novice Programmers. *ACM TOCHI* 31(1), Article 4. https://doi.org/10.1145/3617367
   → Novices "shepherding" and "drifting" with generated code: why answers-on-tap hurts learning.

## Intelligent tutoring systems (pre-LLM grounding)

7. **VanLehn, K. (2011).** The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other
   Tutoring Systems. *Educational Psychologist* 46(4), 197–221. https://doi.org/10.1080/00461520.2011.611369
   → Step-based tutoring nearly as effective as human tutoring; grounds the step-by-step hint design.
8. **Kulik, J.A. and Fletcher, J.D. (2016).** Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review.
   *Review of Educational Research.* https://doi.org/10.3102/0034654315581420

## Still to find (search terms)

- Hint ladders / help-seeking in ITS: search "Aleven help-seeking intelligent tutoring", "bottom-out hints".
- Error message enhancement for novices: search "Becker compiler error messages novices", "programming error message readability".
- Novice error datasets for evaluation: search "Blackbox dataset novice Java errors" (check ethics/licence before use).
