import { defineComponent as w, ref as f, onMounted as g, openBlock as u, createElementBlock as l, createElementVNode as a, Fragment as v, renderList as m, toDisplayString as _, createTextVNode as x, normalizeClass as C, createCommentVNode as h } from "vue";
import { useApi as A, useAuth as I, defineLayout as Q } from "@directus/extensions-sdk";
async function b(i, t, e) {
  return i.post("/rpc/accept_ai_question", {
    p_question_id: t,
    p_user: e
  });
}
async function D(i, t, e, o) {
  return i.post("/rpc/decline_ai_question", {
    p_question_id: t,
    p_user: e,
    p_reason: o
  });
}
const R = { class: "ai-review-list" }, V = ["onClick"], E = {
  key: 0,
  class: "card-body"
}, N = ["onClick"], $ = ["onClick"], B = /* @__PURE__ */ w({
  __name: "interface",
  setup(i) {
    const t = f([]), e = f(null), o = A(), d = I();
    async function p() {
      const { data: c } = await o.get("/items/ai_question_staging", {
        params: {
          filter: { status: { _eq: "pending_review" } },
          fields: "*.*,answer_options.*"
        }
      });
      t.value = c;
    }
    async function y(c) {
      await b(o, c, d.user.id), await p();
    }
    async function k(c) {
      const s = prompt("Reason for decline?");
      s && (await D(o, c, d.user.id, s), await p());
    }
    return g(p), (c, s) => (u(), l("div", R, [
      s[1] || (s[1] = a("h2", null, "AI-Generated Questions Pending Review", -1)),
      (u(!0), l(v, null, m(t.value, (n) => (u(), l("div", {
        key: n.id,
        class: "card"
      }, [
        a("div", {
          class: "card-header",
          onClick: (r) => e.value = e.value === n.id ? null : n.id
        }, " #" + _(n.id) + " – " + _(n.question_prompt.substring(0, 80)), 9, V),
        e.value === n.id ? (u(), l("div", E, [
          a("p", null, [
            s[0] || (s[0] = a("strong", null, "Explanation:", -1)),
            x(" " + _(n.explanation), 1)
          ]),
          a("ul", null, [
            (u(!0), l(v, null, m(n.answer_options, (r) => (u(), l("li", {
              key: r.id,
              class: C({ correct: r.is_correct })
            }, _(r.option_text), 3))), 128))
          ]),
          a("button", {
            onClick: (r) => y(n.id)
          }, "Accept", 8, N),
          a("button", {
            onClick: (r) => k(n.id)
          }, "Decline", 8, $)
        ])) : h("", !0)
      ]))), 128))
    ]));
  }
});
const L = (i, t) => {
  const e = i.__vccOpts || i;
  for (const [o, d] of t)
    e[o] = d;
  return e;
}, q = /* @__PURE__ */ L(B, [["__scopeId", "data-v-d14f2a1f"]]), G = Q({
  id: "review-ai-questions",
  name: "AI Questions Review",
  icon: "task_alt",
  description: "Review and approve/decline AI-generated questions",
  component: q,
  types: ["collection"],
  // Specify the minimum Directus version if needed
  minimumDirectusVersion: "10.10.0"
});
export {
  G as default
};
