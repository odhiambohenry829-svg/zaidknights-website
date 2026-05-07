import Layout from '../components/common/Layout';

export default function Contact() {
  return (
    <Layout title="Contact | ZaidKnights Chess Club" description="Contact ZaidKnights Chess Club for membership, tournaments, and coaching.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Contact us</h1>
            <p className="mt-4 text-lg">Send a message, ask about membership, or join our next event.</p>
            <form className="mt-10 space-y-6">
              <label className="block">
                <span>Name</span>
                <input className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" placeholder="Your name" />
              </label>
              <label className="block">
                <span>Email</span>
                <input type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" placeholder="you@example.com" />
              </label>
              <label className="block">
                <span>Message</span>
                <textarea rows={5} className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" placeholder="How can we help?" />
              </label>
              <button className="rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90">Send message</button>
            </form>
          </div>
          <div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glass text-slate-300">
            <div>
              <h2 className="text-3xl font-semibold text-white">Reach us</h2>
              <p className="mt-4">Nairobi Chess Academy, Nairobi, Kenya</p>
            </div>
            <div className="space-y-4 text-slate-300">
              <p><span className="font-semibold text-white">Email:</span> hello@zaidknights.com</p>
              <p><span className="font-semibold text-white">WhatsApp:</span> +254 700 000 000</p>
              <p><span className="font-semibold text-white">Social:</span> Instagram · TikTok</p>
            </div>
            <div className="rounded-3xl bg-black/60 p-6 text-slate-300">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Location</p>
              <p className="mt-4">Nairobi Chess Academy, Langata Road, Nairobi, Kenya</p>
              <p className="mt-4 text-xs text-slate-500">Google Maps integration is available on the live deployment.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
