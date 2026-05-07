import { galleryItems } from "../../lib/site-data";

export default function GalleryPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Club life</span>
        <h1>Gallery</h1>
        <p>
          Tournament boards, training rooms, and the quiet work of calculating
          better moves.
        </p>
      </section>
      <section className="band alt">
        <div className="container">
          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <article className="gallery-item" key={item.title}>
                <img alt={item.title} src={item.imageUrl} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
