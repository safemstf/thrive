import React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager } from "styled-components";
import Avatar from "@/components/llm/hoda.avatar"; // resolve alias in bundler

type AssistantStatus = "idle" | "loading" | "listening" | "processing" | "speaking" | "error";

function injectHost() {
  if ((window as any).__hoda_injected) return null;
  (window as any).__hoda_injected = true;

  const host = document.createElement("div");
  host.id = "hoda-extension-host";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.bottom = "24px";
  host.style.right = "24px";
  host.style.width = "64px";
  host.style.height = "64px";

  const shadow = host.attachShadow({ mode: "open" });
  const mount = document.createElement("div");
  shadow.appendChild(mount);
  document.documentElement.appendChild(host);

  return { shadow, mount };
}

const HodaContainer: React.FC = () => {
  const [status, setStatus] = React.useState<AssistantStatus>("idle");

  const onClick = React.useCallback(() => {
    setStatus("listening");
    chrome.runtime.sendMessage({ type: "INFER", prompt: "Hello from Edge HODA" }, (res) => {
      if (res?.ok) {
        console.log("generation", res.data);
        setStatus("speaking");
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
      }
    });
  }, []);

  return <Avatar size={64} status={status} onClick={onClick} professionalMode={false} />;
};

const hostInfo = injectHost();
if (hostInfo) {
  const { shadow, mount } = hostInfo;
  const root = createRoot(mount);
  root.render(
    <StyleSheetManager target={shadow}>
      <HodaContainer />
    </StyleSheetManager>
  );
}
