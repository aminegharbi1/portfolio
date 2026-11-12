import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders admin-authored Markdown. Raw HTML is not rendered (react-markdown default). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-site">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
