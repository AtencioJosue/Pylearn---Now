#!/bin/sh
set -eu
export PASSWORD="$(cat /run/secrets/editor_password)"
exec code-server --bind-addr 0.0.0.0:8080 --auth password --disable-telemetry /home/coder/projects
