import { askAccess, terminalQuestion } from "./mcp-login.js";
import { createInterface } from "node:readline/promises";
import { APP_NAMES } from "./presentation.js";
import { TARGETS, groupPlugins, resolvePlugins } from "./catalog.js";
import { localized, t } from "./i18n.js";
import { mcpDependencies, statusMcp } from "./mcp.js";
import { targetHome } from "./fs-utils.js";

/** Every group, plugin and MCP question comes from `catalog`: what the loaded plugins declare. */
export async function runWizard(
  args,
  detected,
  catalog,
  { input = process.stdin, output = process.stdout, ask } = {},
) {
  if (!ask && (!input.isTTY || !output.isTTY)) {
    return {
      ok: false,
      message: t("wizard.needsTerminal", {
        group: catalog.groups.keys().next().value,
        plugin: catalog.plugins.keys().next().value,
      }),
    };
  }
  const rl = ask ? null : createInterface({ input, output });
  const question = ask || ((text) => terminalQuestion(rl, text));
  const choose = async (prompt, options, defaults = []) => {
    while (true) {
      const raw = await question(
        t("wizard.choose", {
          prompt,
          options: options.map((x, i) => `  ${i + 1}. ${x.label}`).join("\n"),
          defaults: defaults.join(","),
        }),
      );
      const values = (raw.trim() || defaults.join(","))
        .split(/[,\s]+/)
        .filter(Boolean)
        .map(Number);
      if (
        values.length &&
        values.every(
          (x) => Number.isInteger(x) && x >= 1 && x <= options.length,
        )
      )
        return [...new Set(values)].map((x) => options[x - 1].id);
      output.write(`${t("wizard.invalid")}\n`);
    }
  };
  try {
    output.write(t("wizard.banner", { owner: catalog.entry.owner }));
    const targets = args.targets.length
      ? args.targets
      : await choose(
          t("wizard.where"),
          TARGETS.map((id) => ({
            id,
            label: `${APP_NAMES[id]}${detected.includes(id) ? t("wizard.detected") : ""}`,
          })),
          detected.map((x) => TARGETS.indexOf(x) + 1),
        );
    const groups =
      args.groups.length || args.plugins.length || !catalog.groups.size
        ? args.groups
        : await choose(
            t("wizard.groups"),
            [...catalog.groups.values()].map((group) => ({
              id: group.id,
              label: groupLabel(group),
            })),
          );
    const autoUpdate =
      args.channel === "stable"
        ? args.autoUpdate
        : await askAutoUpdate(args, question, output);
    const mcpAccess = { ...args.mcpAccess };
    for (const dependency of gatedDependencies(args, groups, catalog)) {
      const { id, provider } = dependency;
      const configured = targets.every((target) =>
        statusMcp({
          home: targetHome(args.home),
          target,
          dependencies: [dependency],
        }).results.some((item) =>
          ["configured", "auth-pending", "verified"].includes(item.state),
        ),
      );
      output.write(
        configured
          ? t("wizard.existing", { name: provider.name })
          : t("wizard.new", {
              name: provider.name,
              url: args.mcpUrls?.[id] ?? provider.url,
            }),
      );
      if (mcpAccess[id] !== undefined) continue;
      const answer = await askAccess({
        access: dependency.access,
        question,
        output,
      });
      if (!answer.ok) return answer;
      mcpAccess[id] = answer.access;
    }
    return {
      ok: true,
      args: {
        ...args,
        targets,
        groups,
        autoUpdate,
        mcpUrls: { ...args.mcpUrls },
        mcpAccess,
        yes: true,
      },
    };
  } catch (error) {
    return { ok: false, message: error.message || t("wizard.cancelled") };
  } finally {
    rl?.close();
  }
}

function groupLabel(group) {
  const label = localized(group.label) ?? group.id;
  const description = localized(group.description);
  return description ? `${label}: ${description}` : label;
}

/** MCP dependencies of the selection that ask about access before a login. */
function gatedDependencies(args, groups, catalog) {
  if (args.mcp === "skip") return [];
  const names = resolvePlugins(catalog, [
    ...new Set([...args.plugins, ...groupPlugins(catalog, groups)]),
  ]);
  const loaded = mcpDependencies({
    plugins: names.map((name) => catalog.plugins.get(name)),
    providers: catalog.providers,
  });
  return (loaded.dependencies || []).filter((dependency) => dependency.access);
}

/** Yes is accepted in English and in Portuguese, whatever the language. */
async function askAutoUpdate(args, question, output) {
  output.write(t("wizard.autoUpdate"));
  return (
    args.autoUpdate ??
    /^(s|sim|y|yes)$/i.test(
      (await question(t("wizard.autoUpdateQuestion"))).trim(),
    )
  );
}
