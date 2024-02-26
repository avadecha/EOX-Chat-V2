FROM ubuntu:jammy-20230308@sha256:7a57c69fe1e9d5b97c5fe649849e79f2cfc3bf11d10bbd5218b4eb61716aebe6


# Setting bash as our shell, and enabling pipefail option
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Some ENV variables
ENV PATH="/mattermost/bin:${PATH}"
ARG PUID=2000
ARG PGID=2000

# # Install needed packages and indirect dependencies
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  ca-certificates \
  curl \
  mime-support \
  unrtf \
  wv \
  poppler-utils \
  tidy \
  tzdata \
  && rm -rf /var/lib/apt/lists/*
COPY server/dist/mattermost-team-linux-amd64.tar.gz .
RUN tar -xvzf mattermost-team-linux-amd64.tar.gz;
COPY server/config/config.json /mattermost/config/config.json
COPY appbot-plugin/dist/com.code.oxzion.mattermost.appbot-plugin server/plugins/
# Set mattermost group/user and download Mattermost
RUN mkdir -p /mattermost/data /mattermost/plugins /mattermost/client/plugins \
  && addgroup -gid ${PGID} mattermost \
  && adduser -q --disabled-password --uid ${PUID} --gid ${PGID} --gecos "" --home /mattermost mattermost \
#  && if [ -n "$MM_PACKAGE" ]; then curl $MM_PACKAGE | tar -xvz ; \
#  else echo "please set the MM_PACKAGE" ; exit 127 ; fi \
  && chown -R mattermost:mattermost /mattermost /mattermost/data /mattermost/plugins /mattermost/client/plugins

# We should refrain from running as privileged user
USER root

#Healthcheck to make sure container is ready
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8065/api/v4/system/ping || exit 1



# Configure entrypoint and command
#COPY --chown=mattermost:mattermost --chmod=765 entrypoint.sh /
#ENTRYPOINT ["/entrypoint.sh"]
WORKDIR /mattermost

COPY installeoxplugins.sh /mattermost/installeoxplugins.sh
#RUN chmod 777 /mattermost/installeoxplugins.sh
#RUN mkdir -p /mattermost/eoxplugins
COPY eoxplugins/ /mattermost/eoxplugins/
#CMD ["./installeoxplugins.sh"]
CMD ["mattermost"]

EXPOSE 8065 8067 8074 8075

# Declare volumes for mount point directories
VOLUME ["/mattermost/data", "/mattermost/logs", "/mattermost/config", "/mattermost/plugins", "/mattermost/client/plugins"]
