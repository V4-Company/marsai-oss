class Marsai < Formula
  desc "MarsAI, V4 Company's development workflow for Claude Code, Codex, Cursor and OpenCode"
  homepage "https://github.com/V4-Company/marsai-oss"
  url "https://github.com/V4-Company/marsai-oss.git", using: :git, tag: "v5.8.0"
  license "Apache-2.0"

  depends_on "node"

  def install
    libexec.install "cli", "plugins", ".claude-plugin", "package.json", "package-lock.json"
    rm_r libexec/"cli/test"
    cd libexec do
      system Formula["node"].opt_bin/"npm", "ci", "--omit=dev", "--ignore-scripts"
    end

    (bin/"marsai").write <<~SH
      #!/bin/bash
      export MARSAI_CHANNEL="${MARSAI_CHANNEL:-stable}"
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/cli/bin/marsai.js" "$@"
    SH
    (bin/"marsai").chmod 0755
  end

  def caveats
    <<~EOS
      The first time, run the wizard to choose the apps and the groups:

        marsai

      After each `brew upgrade marsai`, move the Claude Code pin to the new
      version (Codex, Cursor and OpenCode are copied again in the same step):

        marsai update

      `brew pin marsai` freezes every app on the installed version.

      Before `brew uninstall marsai`, run `marsai remove` to take out what the
      installer placed in the apps.
    EOS
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/marsai --version")
    assert_match "nothing installed", shell_output("#{bin}/marsai --lang en status --home #{testpath}")
  end
end
