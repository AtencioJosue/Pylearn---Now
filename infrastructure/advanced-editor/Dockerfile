FROM ghcr.io/coder/code-server:4.137.0
USER root
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv python3-pip git \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/sudoers.d/nopasswd
COPY transfer.py /opt/pylearn/transfer.py
COPY entrypoint.sh /opt/pylearn/entrypoint.sh
RUN chmod 755 /opt/pylearn/entrypoint.sh \
    && printf '#!/bin/sh\nexec python3 /opt/pylearn/transfer.py "$@"\n' > /usr/local/bin/pylearn-project \
    && chmod 755 /usr/local/bin/pylearn-project \
    && mkdir -p /home/coder/projects /home/coder/.local/share/code-server/User \
    && chown -R coder:coder /home/coder /opt/pylearn
USER coder
RUN python3 -m venv /home/coder/.venv \
    && code-server --install-extension ms-python.python@2026.4.0 \
    && code-server --install-extension ms-python.debugpy@2026.6.0 \
    && code-server --install-extension detachhead.basedpyright@1.40.1
COPY --chown=coder:coder settings.json /home/coder/.local/share/code-server/User/settings.json
ENV PATH="/home/coder/.venv/bin:${PATH}"
WORKDIR /home/coder/projects
ENTRYPOINT ["/opt/pylearn/entrypoint.sh"]
