# Source

- Original: Spec Kit command templates `specify`, `clarify`, `plan` and `tasks` and the document templates for spec, plan, tasks and checklist:
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/commands/specify.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/commands/clarify.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/commands/plan.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/commands/tasks.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/spec-template.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/plan-template.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/tasks-template.md
  - https://github.com/github/spec-kit/blob/4d7cb8e524189369f00376df6284246d3cc4434a/templates/checklist-template.md
- Repository: github/spec-kit, commit 4d7cb8e524189369f00376df6284246d3cc4434a, read on 2026-11-24
- Author: GitHub, Inc. (copyright holder named in the repository licence) and the Spec Kit contributors
- Licence: MIT (full text in LICENSE; the `templates/` folder has no licence of its own, so the repository licence applies)

## Changes
- Merged four separate commands (specify, clarify, plan, tasks) into one skill with three stages and an explicit gate
  after each stage; the clarify command became an optional ambiguity scan inside stage 1.
- Removed everything that depends on the Spec Kit tool: the `specify` CLI, helper scripts (bash, PowerShell,
  Python), `.specify/` config files, extension hooks, command handoffs, slash command names and template placeholders.
  Each script call was replaced by the plain action it performed (create the folder, number it, copy the template).
- Renamed "constitution" to "project principles" and allowed any principles file the project already has.
- Kept the best checklists nearly verbatim: the spec quality checklist, the clarification limits (3 markers, 5
  questions), the reasonable-defaults list, the success-criteria good and bad examples, the strict task format with
  right and wrong examples, the phase structure by user story.
- Condensed the spec, plan and tasks templates (removed sample tasks, layout options and template comments) and
  added a short red-flags table written in our own words.
- Sections renamed to Goal and Steps; front matter for the community format added.
