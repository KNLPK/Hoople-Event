import { useEffect, useRef } from 'react';
import { FieldHead } from './WizardFields';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { Camera, Close, Photos, Plus, Trash, Upload, VideoFile } from '@/components/ui/icons';
import {
  GALLERY_PHOTO_MAX,
  GALLERY_VIDEO_MAX,
  nextId,
  type ActivityDraft,
} from '@/data/builder';

/** 4.2 — the photos and videos that sell the activity. */
export function StepGallery({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const toast = useToast();
  const videoInput = useRef<HTMLInputElement>(null);

  /* Object URLs are only valid while the page lives — release them on unmount. */
  const videos = draft.videos;
  useEffect(
    () => () => {
      videos.forEach((video) => URL.revokeObjectURL(video.url));
    },
    [videos],
  );

  function addPhotoSlot() {
    if (draft.gallery.length >= GALLERY_PHOTO_MAX) {
      toast(`A gallery holds up to ${GALLERY_PHOTO_MAX} photos`);
      return;
    }
    set('gallery')([...draft.gallery, nextId('g', draft.gallery.map((id) => ({ id })))]);
  }

  function acceptVideo(file: File | undefined) {
    if (!file) return;
    if (draft.videos.length >= GALLERY_VIDEO_MAX) {
      toast(`You can add up to ${GALLERY_VIDEO_MAX} videos`);
      return;
    }
    set('videos')([
      ...draft.videos,
      { id: nextId('v', draft.videos), name: file.name, url: URL.createObjectURL(file) },
    ]);
  }

  return (
    <>
      <p className="wiz-section__lede">
        Showcase your activity with photos and videos. Great visuals help participants feel excited to
        join!
      </p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <FieldHead
            label="Cover Image"
            required
            hint="This is the main image that will appear on the activity card."
          />
          <div className="wiz-cover">
            <div className="wiz-cover__slot wiz-cover__slot--tall">
              {/* The same slot 1.1 fills — one cover, two places to set it. */}
              <ImageSlot
                id="builder-cover"
                src={draft.cover}
                onChange={set('cover')}
                radius={12}
                placeholder="Upload cover image"
                hint="JPG, PNG up to 10MB"
              />
              {draft.cover ? (
                <>
                  <span className="wiz-cover__change">
                    <Camera size={14} color="#12121A" strokeWidth={1.9} />
                    Change Image
                  </span>
                  <button
                    type="button"
                    className="wiz-cover__clear"
                    onClick={() => {
                      set('cover')(undefined);
                      toast('Cover image cleared');
                    }}
                    aria-label="Remove cover image"
                  >
                    <Trash size={14} color="#E11D48" strokeWidth={1.9} />
                  </button>
                </>
              ) : null}
            </div>
            <aside className="wiz-tips">
              <div className="flex items-center gap-[7px] text-[12.5px] font-semibold text-brand mb-[9px]">
                <Photos size={15} color="#6D28FF" strokeWidth={1.9} />
                Tips
              </div>
              <p className="text-[12px] text-grey leading-[1.55]">
                Use a high-quality image that represents your activity. Recommended size 1280 x 720px
                (16:9).
              </p>
            </aside>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <FieldHead
              label="Gallery Photos"
              hint="Add photos that highlight your activity, venue, and experience."
            />
            <div className="flex flex-col items-end gap-1.5 flex-none">
              <button type="button" className="wiz-addsession" onClick={addPhotoSlot}>
                <Plus size={14} color="#6D28FF" strokeWidth={2} />
                Add Photos
              </button>
              <span className="text-[11.5px] text-grey">
                You can add up to {GALLERY_PHOTO_MAX} photos
              </span>
            </div>
          </div>

          <div className="wiz-gallery">
            {draft.gallery.map((id) => (
              <div key={id} className="wiz-gallery__item">
                <ImageSlot id={`builder-gallery-${id}`} radius={10} placeholder="Photo" />
                <button
                  type="button"
                  className="wiz-chipx"
                  onClick={() => set('gallery')(draft.gallery.filter((item) => item !== id))}
                  aria-label="Remove photo"
                >
                  <Close size={11} color="#3C3A4A" />
                </button>
              </div>
            ))}
          </div>

          <div className="wiz-drop">
            <Upload size={22} color="#6D28FF" strokeWidth={1.7} />
            <span>
              <strong>Drag &amp; drop photos</strong> onto a slot above, or{' '}
              <button type="button" onClick={addPhotoSlot}>
                add another slot
              </button>
            </span>
            <span className="text-[11.5px] text-grey">JPG, PNG up to 10MB each</span>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <FieldHead
              label="Gallery Videos (Optional)"
              hint="Add short videos to give participants a better preview of your activity."
            />
            <div className="flex flex-col items-end gap-1.5 flex-none">
              <button
                type="button"
                className="wiz-addsession"
                onClick={() => videoInput.current?.click()}
              >
                <Plus size={14} color="#6D28FF" strokeWidth={2} />
                Add Video
              </button>
              <span className="text-[11.5px] text-grey">You can add up to {GALLERY_VIDEO_MAX} videos</span>
            </div>
          </div>

          {draft.videos.length > 0 ? (
            <div className="wiz-videos">
              {draft.videos.map((video) => (
                <figure key={video.id} className="wiz-video">
                  <video src={video.url} controls preload="metadata" />
                  <figcaption>{video.name}</figcaption>
                  <button
                    type="button"
                    className="wiz-chipx"
                    onClick={() => {
                      URL.revokeObjectURL(video.url);
                      set('videos')(draft.videos.filter((item) => item.id !== video.id));
                    }}
                    aria-label={`Remove ${video.name}`}
                  >
                    <Close size={11} color="#3C3A4A" />
                  </button>
                </figure>
              ))}
            </div>
          ) : null}

          <div
            className="wiz-drop"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              acceptVideo(event.dataTransfer.files[0]);
            }}
          >
            <VideoFile size={22} color="#6D28FF" strokeWidth={1.7} />
            <span>
              <strong>Drag &amp; drop video</strong> here or{' '}
              <button type="button" onClick={() => videoInput.current?.click()}>
                click to upload
              </button>
            </span>
            <span className="text-[11.5px] text-grey">MP4 up to 100MB</span>
          </div>

          <input
            ref={videoInput}
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(event) => acceptVideo(event.target.files?.[0])}
          />
        </section>
      </div>
    </>
  );
}
