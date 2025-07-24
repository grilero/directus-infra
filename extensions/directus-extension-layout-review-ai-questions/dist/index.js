import { defineComponent as k, ref as p, onMounted as x, openBlock as r, createElementBlock as u, createElementVNode as s, Fragment as v, renderList as f, toDisplayString as _, createTextVNode as C, normalizeClass as h, createCommentVNode as Q } from "vue";
import { Directus as w } from "@directus/sdk";
const m = new w(window.location.origin + "/");
async function A(i, n) {
  return m.rpc("accept_ai_question", { p_question_id: i, p_user: n });
}
async function I(i, n, t) {
  return m.rpc("decline_ai_question", { p_question_id: i, p_user: n, p_reason: t });
}
const b = { class: "ai-review-list" }, D = ["onClick"], R = {
  key: 0,
  class: "card-body"
}, B = ["onClick"], E = ["onClick"], N = /* @__PURE__ */ k({
  __name: "interface",
  setup(i) {
    const n = p([]), t = p(null), d = new w(window.location.origin + "/");
    async function l() {
      const { data: c } = await d.items("ai_question_staging").readByQuery({
        filter: { status: { _eq: "pending_review" } },
        fields: ["*", {
          answer_options: ["id", "option_text", "is_correct"]
        }]
      });
      n.value = c;
    }
    async function y(c) {
      await A(c, (await d.auth.me()).id), await l();
    }
    async function g(c) {
      const o = prompt("Reason for decline?");
      o && (await I(c, (await d.auth.me()).id, o), await l());
    }
    return x(l), (c, o) => (r(), u("div", b, [
      o[1] || (o[1] = s("h2", null, "AI-Generated Questions Pending Review", -1)),
      (r(!0), u(v, null, f(n.value, (e) => (r(), u("div", {
        key: e.id,
        class: "card"
      }, [
        s("div", {
          class: "card-header",
          onClick: (a) => t.value = t.value === e.id ? null : e.id
        }, " #" + _(e.id) + " – " + _(e.question_prompt.substring(0, 80)), 9, D),
        t.value === e.id ? (r(), u("div", R, [
          s("p", null, [
            o[0] || (o[0] = s("strong", null, "Explanation:", -1)),
            C(" " + _(e.explanation), 1)
          ]),
          s("ul", null, [
            (r(!0), u(v, null, f(e.answer_options, (a) => (r(), u("li", {
              key: a.id,
              class: h({ correct: a.is_correct })
            }, _(a.option_text), 3))), 128))
          ]),
          s("button", {
            onClick: (a) => y(e.id)
          }, "Accept", 8, B),
          s("button", {
            onClick: (a) => g(e.id)
          }, "Decline", 8, E)
        ])) : Q("", !0)
      ]))), 128))
    ]));
  }
});
const V = (i, n) => {
  const t = i.__vccOpts || i;
  for (const [d, l] of n)
    t[d] = l;
  return t;
}, $ = /* @__PURE__ */ V(N, [["__scopeId", "data-v-0c5f29c0"]]), F = {
  id: "review-ai-questions",
  name: "AI Questions Review",
  icon: "task_alt",
  description: "Review and approve/decline AI-generated questions",
  component: $
};
export {
  F as default
};
