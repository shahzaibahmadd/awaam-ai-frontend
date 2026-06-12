import Layout from '../components/Layout';

export default function InfoPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-100">About Awaam AI</h1>
        <p className="mt-3 text-gray-400">Awaam AI is a Pakistani assistant that helps you navigate public services like DLIMS, NADRA, DGIP, and more. It combines retrieval with LLMs to give concise, step‑by‑step answers.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { title: 'Fast and Relevant', desc: 'Answers grounded in curated FAQs and official sources.' },
            { title: 'Privacy First', desc: 'Your chats are stored securely. You control your data.' },
            { title: 'Always Improving', desc: 'We continuously update data and models for accuracy.' },
            { title: 'Built in Pakistan', desc: 'Designed for local needs and vernacular usage.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}


