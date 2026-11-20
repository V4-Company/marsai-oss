# MarsAI diagram doctor

Report the installed skill directory, provenance from [UPSTREAM.md](../UPSTREAM.md), [license](../LICENSE.txt), profile library/marker and effective profile. Check that references, templates and `scripts/self_check.py`, `verify-geometry.py`, `export_svg.py` and the three import extractors exist. List the installed `verify-*.py` files, not a cached upstream inventory.

Check available Python 3.10+ and a browser capable of rendering and screenshots. All Python checks and extractors use the standard library. PNG capture can use the host's browser or local Chrome/Chromium; installing another browser runtime requires following the host's normal workflow. Report missing prerequisites and the specific operation they affect.

The upstream global plugin, its commands and its repository maintenance tests are independent. All MarsAI operations route through `/marsai-extras:marsai-diagram`. No change to the upstream install is needed.
