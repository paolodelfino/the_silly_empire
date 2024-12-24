"use client";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import {
  EosIconsLoading,
  IcBaselineAspectRatio,
  IcBaselineClose,
  IcBaselineFitScreen,
  IcBaselineForward5,
  IcBaselineFullscreen,
  IcBaselineFullscreenExit,
  IcBaselineHighlight,
  IcBaselinePause,
  IcBaselinePlayArrow,
  IcBaselineReplay5,
  IcBaselineViewSidebar,
  IcBaselineVolumeDown,
  IcBaselineVolumeMute,
  IcBaselineVolumeOff,
  IcBaselineVolumeUp,
} from "@/components/icons";
import { ScContext } from "@/components/ScProvider";
import { Button, IconButton } from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { db } from "@/db/db";
import schemaTitle from "@/schemas/schemaTitle";
import useQueryFetchPlaylist from "@/stores/queries/useQueryFetchPlaylist";
import useQueryFetchSeason from "@/stores/queries/useQueryFetchSeason";
import { cn } from "@/utils/cn";
import { px } from "@/utils/css";
import { Dictionary } from "@/utils/dictionary";
import Hls, { HlsListeners } from "hls.js";
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import ReactSlider from "react-slider";
import { VideoSeekSlider } from "react-video-seek-slider";
import "react-video-seek-slider/styles.css";
import { z } from "zod";

export default function Player({
  data,
  close,
  dictionary,
}: {
  data: z.infer<typeof schemaTitle>;
  close: () => void;
  dictionary: Pick<Dictionary, "player" | "fetching" | "loadingNoCache">;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const season = useQueryFetchSeason();
  const sc = useContext(ScContext);
  const playlist = useQueryFetchPlaylist();
  const video = useRef<HTMLVideoElement | null>(null);
  const [fitScreen, setFitScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  const hls = useRef(new Hls());
  const [overlayOpen, setOverlayOpen] = useState(true);
  const touchDown1 = useRef(false);
  const touchDown2 = useRef(false);
  const sidebar = useRef<HTMLDivElement | null>(null);
  const sidebarId = useId();
  const sidebarLeft = useRef<HTMLDivElement | null>(null);
  const [fetchingEpisodeScwsId, setFetchingEpisodeScwsId] = useState(-1);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(-1);
  const [currentTime, setCurrentTime] = useState(-1);
  const [maxTime, setMaxTime] = useState(-1);
  const interval = useRef<NodeJS.Timeout | undefined>(undefined);
  const [audioTracks, setAudioTracks] = useState<
    { name: string; index: number }[] | undefined
  >();
  const [levels, setLevels] = useState<
    { name: string; index: number }[] | undefined
  >();
  const [subtitleTracks, setSubtitleTracks] = useState<
    { name: string; index: number }[] | undefined
  >();
  // TODO: Non tengono il passo con il player nativo di ios (fix: cambio diretto da hls object in field select e set dello stato dagli eventi su hls object)
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const ref = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const maxTimeRef = useRef(-1);

  const playlistFetch = useCallback(
    (
      values: Parameters<typeof playlist.fetch>["0"] &
        Partial<typeof playlist.meta>,
    ) => {
      playlist.setMeta({
        lastEpisodeNumber: values.lastEpisodeNumber,
        lastSeasonNumber: values.lastSeasonNumber,
      });
      return playlist.fetch({
        scwsId: values.scwsId,
        titleId: values.titleId,
        episodeId: values.episodeId,
      });
    },
    [playlist],
  );

  useEffect(() => {
    season.active();
    playlist.active();

    if (data.id !== season.meta.lastTitleId) {
      maxTimeRef.current = -1;
      season.reset();
      season.active();
      season.setMeta({
        lastTitleId: data.id,
        seasonSelectField: undefined,
        lastSeasonFetched: undefined,
      });
      playlist.reset();
      playlist.active();

      if (data.type === "tv") {
        db.continueWatchingTitle
          .where("titleId")
          .equals(data.id)
          .first()
          .then((title) => {
            let selectedItem = undefined;

            if (title !== undefined) {
              const seasonId = data.seasons.find(
                (it) => it.number === title.seasonNumber!,
              )!.id;
              selectedItem = seasonId.toString();
            }

            season.setMeta({
              seasonSelectField: fieldSelect({
                items: data.seasons.map((it) => ({
                  content:
                    `${dictionary.player.season} ${it.number} ` +
                    (it.episodes_count > 0
                      ? `(${it.episodes_count})`
                      : `${dictionary.player.comingOn} ${it.release_date}`),
                  id: it.id.toString(),
                  disabled: it.episodes_count <= 0,
                })),
                selectedItem: selectedItem,
              }),
            });

            setSidebarOpen(true);
          });
      } else playlistFetch({ scwsId: data.scws_id!, titleId: data.id });
    }

    return () => {
      season.inactive();
      playlist.inactive();
    };
  }, [data.id]);

  useEffect(() => {
    if (video.current !== null) {
      video.current.addEventListener("waiting", () => {
        setLoading(true);
      });
      video.current.addEventListener("playing", () => {
        setLoading(false);
      });
      video.current.addEventListener("pause", () => {
        setPaused(true);
        clearInterval(interval.current);
      });
      video.current.addEventListener("play", () => {
        setPaused(false);
      });
      video.current.addEventListener("canplay", () => {
        setCanPlay(true);
      });
      video.current.addEventListener("volumechange", () => {
        setMuted(video.current!.muted);
        setVolume(video.current!.volume);
      });
      video.current.addEventListener("loadeddata", () => {
        setMaxTime(video.current!.duration * 1000);
        maxTimeRef.current = video.current!.duration;
        setVolume(video.current!.volume);
      });

      const mutationObserver = new MutationObserver((mutations) => {
        if (video.current!.controls) video.current!.controls = false;
      });
      mutationObserver.observe(video.current, {
        attributeFilter: ["controls"],
      });

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "k" || e.key === "K" || e.key === " ")
          video.current!.paused
            ? video.current!.play()
            : video.current!.pause();
        else if (e.key === "v" || e.key === "V")
          setOverlayOpen((state) => !state);
        else if (e.key === "ArrowLeft") video.current!.currentTime -= 5;
        else if (e.key === "ArrowRight") video.current!.currentTime += 5;
        else if (e.key === "ArrowUp")
          video.current!.volume = Math.min(1, video.current!.volume + 0.05);
        else if (e.key === "ArrowDown")
          video.current!.volume = Math.max(0, video.current!.volume - 0.05);
        else if (e.key === "m" || e.key === "M")
          video.current!.muted = !video.current!.muted;
      };
      const onFullscreenChange = () => {
        setFullscreen(document.fullscreenElement === ref.current);
      };

      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      return () => {
        clearInterval(interval.current);

        mutationObserver.disconnect();

        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }
  }, []);

  const updateTime = useCallback(() => {
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      if (maxTimeRef.current !== -1) {
        setCurrentTime(video.current!.currentTime * 1000);

        db.continueWatchingTitle.put({
          titleId: data.id,
          seasonNumber: playlist.meta.lastSeasonNumber,
          episodeNumber: playlist.meta.lastEpisodeNumber,
          poster: data.poster,
          currentTime: video.current!.currentTime,
          maxTime: maxTimeRef.current,
          lastUpdated: new Date(),
        });
      }
    }, 1000);
  }, [playlist, data]);

  useEffect(() => {
    video.current?.addEventListener("play", updateTime);
    return () => {
      video.current?.removeEventListener("play", updateTime);
    };
  }, [video, updateTime]);

  useEffect(() => {
    if (playlist.data !== undefined && video.current !== null) {
      const onManifestParsed: HlsListeners[typeof Hls.Events.MANIFEST_PARSED] =
        (e, playlistData) => {
          hls.current.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);

          setAudioTracks(
            playlistData.audioTracks.map((it, i) => ({
              name: it.name,
              index: i,
            })),
          );
          setLevels([
            { name: "Auto", index: -1 },
            ...playlistData.levels.map((it, i) => ({
              name: `${it.width}x${it.height}`,
              index: i,
            })),
          ]);
          setSubtitleTracks([
            { name: "Off", index: -1 },
            ...playlistData.subtitleTracks.map((it, i) => ({
              name: it.name,
              index: i,
            })),
          ]);

          db.continueWatchingTitle
            .where("titleId")
            .equals(data.id)
            .and(
              (title) =>
                data.type === "movie" ||
                (playlist.meta.lastSeasonNumber === title.seasonNumber &&
                  playlist.meta.lastEpisodeNumber === title.episodeNumber),
            )
            .first()
            .then((title) => {
              if (title !== undefined)
                video.current!.currentTime = title.currentTime;
            });
        };
      const onLevelLoaded: HlsListeners[typeof Hls.Events.LEVEL_LOADED] = (
        e,
        data,
      ) => {
        hls.current.off(Hls.Events.LEVEL_LOADED, onLevelLoaded);

        setCanPlay(true);
      };

      hls.current.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.current.on(Hls.Events.LEVEL_LOADED, onLevelLoaded);

      hls.current.loadSource(playlist.data);
      hls.current.attachMedia(video.current);

      if (playlist.meta.lastEpisodeNumber !== undefined)
        document.title = `Playing S${playlist.meta.lastSeasonNumber} E${playlist.meta.lastEpisodeNumber}`;
      else document.title = `Playing`;
    }

    return () => {
      hls.current.detachMedia();
      setAudioTracks(undefined);
      setSubtitleTracks(undefined);
      setLevels(undefined);
      setCurrentAudioTrack(0);
      setCurrentLevel(-1);
      setCurrentSubtitleTrack(-1);
      document.title = "The Silly Empire";
    };
  }, [playlist.data]);

  useEffect(() => {
    if (currentAudioTrack !== undefined)
      hls.current.audioTrack = currentAudioTrack;
  }, [currentAudioTrack, playlist.data]);
  useEffect(() => {
    if (currentLevel !== undefined) hls.current.currentLevel = currentLevel;
  }, [currentLevel, playlist.data]);
  useEffect(() => {
    if (currentSubtitleTrack !== undefined)
      hls.current.subtitleTrack = currentSubtitleTrack;
  }, [currentSubtitleTrack, playlist.data]);

  useEffect(() => {
    if (
      season.meta.seasonSelectField?.value !== undefined &&
      season.isActive &&
      season.meta.seasonSelectField.value !== season.meta.lastSeasonFetched
    ) {
      const entry = data.seasons.find(
        (it) => it.id.toString() === season.meta.seasonSelectField!.value,
      )!;
      season.setMeta({
        lastSeasonFetched: season.meta.seasonSelectField.value,
      });
      season
        .fetch({
          number: entry.number,
          id: data.id,
        })
        .then((season) => {
          const findAndScroll = () => {
            const activeElement = document.getElementById(
              `${sidebarId}_activeElement`,
            )!;
            const sidebarLeftRect =
              sidebarLeft.current!.getBoundingClientRect();
            sidebar.current!.scroll({
              left: activeElement.offsetLeft - sidebarLeftRect.width,
            });
          };

          if (
            playlist.meta.lastSeasonNumber === undefined ||
            playlist.lastArgs?.[0].titleId !== data.id
          ) {
            db.continueWatchingTitle
              .where("titleId")
              .equals(data.id)
              .and((title) => title.seasonNumber === entry.number)
              .first()
              .then((title) => {
                if (title !== undefined) {
                  const episode = season.episodes.find(
                    (it) => it.number === title.episodeNumber!,
                  )!;
                  hls.current.detachMedia();
                  setLoading(false);
                  setPaused(true);
                  setCanPlay(false);
                  playlist.reset();
                  playlist.active();
                  video.current!.src = "";
                  setFetchingEpisodeScwsId(episode.scws_id);
                  playlistFetch({
                    scwsId: episode.scws_id,
                    titleId: data.id,
                    episodeId: episode.id,
                    lastEpisodeNumber: episode.number,
                    lastSeasonNumber: title.seasonNumber!,
                  }).then((_) => {
                    setFetchingEpisodeScwsId(-1);
                    setTimeout(findAndScroll, 500);
                  });
                }
              });
          } else if (
            entry.number === playlist.meta.lastSeasonNumber &&
            playlist.lastArgs?.[0].titleId === data.id
          ) {
            setTimeout(findAndScroll, 500);
          }
        });
    }
  }, [season.meta.seasonSelectField?.value]);

  // useEffect(() => {
  //   if (
  //     season.meta.seasonSelectField?.value !== undefined &&
  //     season.isActive &&
  //     season.meta.seasonSelectField.value === season.meta.lastSeasonFetched
  //   ) {
  //     const entry = data.seasons.find(
  //       (it) => it.id.toString() === season.meta.seasonSelectField!.value,
  //     )!;
  //     const findAndScroll = () => {
  //       const activeElement = document.getElementById(
  //         `${sidebarId}_activeElement`,
  //       )!;
  //       const sidebarLeftRect = sidebarLeft.current!.getBoundingClientRect();
  //       sidebar.current!.scroll({
  //         left: activeElement.offsetLeft - sidebarLeftRect.width,
  //       });
  //     };
  //     if (
  //       entry.number === playlist.meta.lastSeasonNumber &&
  //       playlist.lastArgs![0].titleId === data.id
  //     ) {
  //       setTimeout(findAndScroll, 500);
  //     }
  //   }
  // }, [playlist.meta]);

  const formatTime = useCallback(
    (value: number) => {
      let secs = Math.floor(value / 1000);
      let mins = Math.floor(secs / 60);
      let hours = Math.floor(mins / 60);

      secs = secs % 60;
      mins = mins % 60;

      const maxTimeHours = Math.floor(maxTime / 1000 / 60 / 60);

      return `${hours <= 0 && maxTimeHours <= 0 ? "" : `${hours}:`}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
    [maxTime],
  );

  return ReactDOM.createPortal(
    <RemoveScroll>
      <div
        className={cn(
          "fixed left-0 top-0",
          "h-screen w-full",
          "bg-black",
          "z-20",
          !overlayOpen && "cursor-none",
        )}
        ref={ref}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          onPointerDown={(e) => {
            if (
              e.target === e.currentTarget ||
              e.target instanceof HTMLVideoElement
            ) {
              if (e.pointerType === "mouse") setOverlayOpen((state) => !state);
              else touchDown1.current = true;
            }
          }}
          onPointerUp={(e) => {
            if (
              e.target === e.currentTarget ||
              e.target instanceof HTMLVideoElement
            ) {
              if (e.pointerType === "touch" && touchDown1.current === true)
                setOverlayOpen((state) => !state);
            }
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={video}
            // playsInline
            className={cn(fitScreen && "aspect-auto h-full w-auto")}
          />
        </div>

        {overlayOpen && (
          <React.Fragment>
            <div
              className="fixed right-0 top-0 w-full"
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "mouse") setOverlayOpen(false);
                  else touchDown2.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "touch" && touchDown2.current === true)
                    setOverlayOpen(false);
                }
              }}
            >
              <div
                className="mx-auto flex w-full max-w-4xl items-center justify-end gap-4 p-2 pr-[calc(0.5rem+env(safe-area-inset-right))]"
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) {
                    if (e.pointerType === "mouse") setOverlayOpen(false);
                    else touchDown2.current = true;
                  }
                }}
                onPointerUp={(e) => {
                  if (e.target === e.currentTarget) {
                    if (
                      e.pointerType === "touch" &&
                      touchDown2.current === true
                    )
                      setOverlayOpen(false);
                  }
                }}
              >
                <IconButton
                  disabled={playlist.data === undefined}
                  action={() => {}}
                  classNames={{ button: "[&.hover_svg]:text-black" }}
                >
                  {(className) => (
                    <IcBaselineHighlight
                      className={cn(className, "text-neutral-300")}
                    />
                  )}
                </IconButton>

                {document.fullscreenEnabled && (
                  <IconButton
                    action={() => {
                      if (fullscreen) document.exitFullscreen();
                      else ref.current!.requestFullscreen();
                    }}
                    classNames={{ button: "[&.hover_svg]:text-black" }}
                  >
                    {(className) =>
                      fullscreen ? (
                        <IcBaselineFullscreenExit
                          className={cn(className, "text-neutral-300")}
                        />
                      ) : (
                        <IcBaselineFullscreen
                          className={cn(className, "text-neutral-300")}
                        />
                      )
                    }
                  </IconButton>
                )}

                <IconButton
                  disabled={playlist.data === undefined}
                  action={() => {
                    setFitScreen((state) => !state);
                  }}
                  classNames={{ button: "[&.hover_svg]:text-black" }}
                >
                  {(className) =>
                    fitScreen ? (
                      <IcBaselineAspectRatio
                        className={cn(className, "text-neutral-300")}
                      />
                    ) : (
                      <IcBaselineFitScreen
                        className={cn(className, "text-neutral-300")}
                      />
                    )
                  }
                </IconButton>

                {data.type === "tv" && (
                  <IconButton
                    action={() => setSidebarOpen((state) => !state)}
                    classNames={{ button: "[&.hover_svg]:text-black" }}
                  >
                    {(className) => (
                      <IcBaselineViewSidebar
                        className={cn(className, "text-neutral-300")}
                      />
                    )}
                  </IconButton>
                )}

                <IconButton
                  action={close}
                  classNames={{ button: "[&.hover_svg]:text-black" }}
                >
                  {(className) => (
                    <IcBaselineClose
                      className={cn(className, "text-neutral-300")}
                    />
                  )}
                </IconButton>
              </div>
            </div>

            <div
              className="fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-12"
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "mouse") setOverlayOpen(false);
                  else touchDown2.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "touch" && touchDown2.current === true)
                    setOverlayOpen(false);
                }
              }}
            >
              <IconButton
                disabled={playlist.data === undefined}
                action={() => {
                  video.current!.currentTime -= 5;
                }}
                classNames={{ button: "[&.hover_svg]:text-black size-20" }}
              >
                {(className) => (
                  <IcBaselineReplay5
                    className={cn(className, "size-16 text-neutral-300")}
                  />
                )}
              </IconButton>
              <IconButton
                disabled={playlist.data === undefined || !canPlay}
                action={() => {
                  {
                    if (video.current!.paused) video.current!.play();
                    else video.current!.pause();
                  }
                }}
                classNames={{ button: "[&.hover_svg]:text-black size-20" }}
              >
                {(className) =>
                  paused ? (
                    <IcBaselinePlayArrow
                      className={cn(className, "size-16 text-neutral-300")}
                    />
                  ) : (
                    <IcBaselinePause
                      className={cn(className, "size-16 text-neutral-300")}
                    />
                  )
                }
              </IconButton>
              <IconButton
                disabled={playlist.data === undefined}
                action={() => {
                  video.current!.currentTime += 5;
                }}
                classNames={{ button: "[&.hover_svg]:text-black size-20" }}
              >
                {(className) => (
                  <IcBaselineForward5
                    className={cn(className, "size-16 text-neutral-300")}
                  />
                )}
              </IconButton>
            </div>

            <div
              className="fixed bottom-0 left-0 w-full pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] pt-4"
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "mouse") setOverlayOpen(false);
                  else touchDown2.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.pointerType === "touch" && touchDown2.current === true)
                    setOverlayOpen(false);
                }
              }}
            >
              <div
                className="mx-auto flex w-full max-w-4xl flex-col gap-4"
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) {
                    if (e.pointerType === "mouse") setOverlayOpen(false);
                    else touchDown2.current = true;
                  }
                }}
                onPointerUp={(e) => {
                  if (e.target === e.currentTarget) {
                    if (
                      e.pointerType === "touch" &&
                      touchDown2.current === true
                    )
                      setOverlayOpen(false);
                  }
                }}
              >
                <div className="w-fit overflow-x-auto py-2 pr-2">
                  <div className="ml-auto flex w-fit items-center gap-2 sm:ml-0">
                    <IconButton
                      disabled={playlist.data === undefined}
                      action={() => {
                        video.current!.muted = !video.current!.muted;
                      }}
                      classNames={{
                        button: "[&.hover_svg]:text-black shrink-0",
                      }}
                    >
                      {(className) =>
                        muted ? (
                          <IcBaselineVolumeOff
                            className={cn(className, "text-neutral-300")}
                          />
                        ) : volume === 0 ? (
                          <IcBaselineVolumeMute
                            className={cn(className, "text-neutral-300")}
                          />
                        ) : volume < 0.5 ? (
                          <IcBaselineVolumeDown
                            className={cn(className, "text-neutral-300")}
                          />
                        ) : (
                          <IcBaselineVolumeUp
                            className={cn(className, "text-neutral-300")}
                          />
                        )
                      }
                    </IconButton>

                    <ReactSlider
                      disabled={playlist.data === undefined}
                      min={0}
                      max={1}
                      value={volume}
                      onChange={(value) => (video.current!.volume = value)}
                      className="relative mr-6 flex h-10 w-32 items-center hover:cursor-pointer sm:mr-4 md:mr-2"
                      step={0.005}
                      renderTrack={({ key, ...props }, state) => (
                        <div
                          key={key}
                          {...props}
                          className={cn(
                            "h-2",
                            state.index === 0 ? "bg-white" : "bg-white/40",
                          )}
                          style={{
                            width: px(
                              8 *
                                (state.index === 0
                                  ? state.value
                                  : 1 - state.value),
                            ),
                          }}
                        />
                      )}
                      renderThumb={({ key, ...props }, state) => (
                        <div
                          key={key}
                          {...props}
                          className="absolute size-10 rounded-full bg-white sm:size-8 md:size-6"
                          style={{
                            left: px(8 * state.value - 1.5 / 2),
                          }}
                        />
                      )}
                    />

                    {subtitleTracks !== undefined &&
                      subtitleTracks.length > 1 && (
                        <FieldSelect
                          disabled={playlist.data === undefined}
                          meta={{
                            items: subtitleTracks.map((it) => ({
                              content: it.name,
                              id: it.index.toString(),
                              index: it.index,
                              disabled:
                                currentSubtitleTrack.toString() ===
                                it.index.toString(),
                            })),
                            selectedItem: currentSubtitleTrack.toString(),
                          }}
                          setMeta={(value) => {
                            setCurrentSubtitleTrack(
                              Number(value.selectedItem!),
                            );
                          }}
                          placeholder="Subtitle"
                          error={undefined}
                          setValue={() => {}}
                        />
                      )}

                    {audioTracks !== undefined && audioTracks.length > 0 && (
                      <FieldSelect
                        disabled={playlist.data === undefined}
                        meta={{
                          items: audioTracks.map((it) => ({
                            content: it.name,
                            id: it.index.toString(),
                            index: it.index,
                            disabled:
                              currentAudioTrack.toString() ===
                              it.index.toString(),
                          })),
                          selectedItem: currentAudioTrack.toString(),
                        }}
                        setMeta={(value) => {
                          setCurrentAudioTrack(Number(value.selectedItem!));
                        }}
                        placeholder="Audio"
                        error={undefined}
                        setValue={() => {}}
                      />
                    )}

                    {levels !== undefined && levels.length > 1 && (
                      <FieldSelect
                        disabled={playlist.data === undefined}
                        meta={{
                          items: levels.map((it) => ({
                            content: it.name,
                            id: it.index.toString(),
                            index: it.index,
                            disabled:
                              currentLevel.toString() === it.index.toString(),
                          })),
                          selectedItem: currentLevel.toString(),
                        }}
                        setMeta={(value) => {
                          setCurrentLevel(Number(value.selectedItem!));
                        }}
                        placeholder="Quality"
                        error={undefined}
                        setValue={() => {}}
                      />
                    )}
                  </div>
                </div>

                <span
                  className="pointer-events-none leading-3 text-neutral-300"
                  style={{ textShadow: "1px 1px 1px #000" }}
                >
                  {formatTime(currentTime)} / {formatTime(maxTime)}
                </span>

                <div className="min-h-8 w-full">
                  <VideoSeekSlider
                    max={maxTime}
                    currentTime={currentTime}
                    onChange={(time, offsetTime) => {
                      video.current!.currentTime = time / 1000;
                      setCurrentTime(time);
                    }}
                    limitTimeTooltipBySides={true}
                  />
                </div>
              </div>
            </div>

            {sidebarOpen && (
              <div
                ref={sidebar}
                className="fixed bottom-0 left-0 z-10 flex w-full shrink-0 overflow-x-scroll bg-black pb-safe-bottom pl-safe-left pr-safe-right"
              >
                <div
                  ref={sidebarLeft}
                  className="sticky left-0 z-[1] flex shrink-0 flex-col gap-2 bg-black p-2"
                >
                  {season.meta.seasonSelectField !== undefined && (
                    <FieldSelect
                      setMeta={(value) => {
                        const a = { ...season.meta.seasonSelectField! };
                        a.meta = { ...a.meta, ...value };
                        season.setMeta({ seasonSelectField: a });
                      }}
                      setValue={(value) => {
                        const a = { ...season.meta.seasonSelectField! };
                        a.value = value;
                        season.setMeta({ seasonSelectField: a });
                      }}
                      meta={season.meta.seasonSelectField.meta}
                      error={season.meta.seasonSelectField.error}
                      disabled={false}
                      placeholder={dictionary.player.season}
                      full
                      buttonClassName="min-w-22"
                    />
                  )}

                  {playlist.data !== undefined && (
                    <Button
                      className="w-full max-w-32"
                      action={() => {
                        const findAndScroll = () => {
                          const activeElement = document.getElementById(
                            `${sidebarId}_activeElement`,
                          )!;
                          const sidebarLeftRect =
                            sidebarLeft.current!.getBoundingClientRect();
                          sidebar.current!.scroll({
                            left:
                              activeElement.offsetLeft - sidebarLeftRect.width,
                          });
                        };

                        if (
                          season.lastArgs![0].number ===
                          playlist.meta.lastSeasonNumber!
                        )
                          findAndScroll();
                        else {
                          const seasonId = data.seasons.find(
                            (it) =>
                              it.number === playlist.meta.lastSeasonNumber!,
                          )!.id;
                          const a = { ...season.meta.seasonSelectField! };
                          a.meta = {
                            ...a.meta,
                            ...{
                              selectedItem: seasonId.toString(),
                            },
                          };
                          season.setMeta({ seasonSelectField: a });
                        }
                      }}
                    >
                      {dictionary.player.findPlayingEpisode}
                    </Button>
                  )}
                </div>

                <div className="flex shrink-0 gap-4 pb-4 pr-4">
                  {season.isFetching && season.data === undefined && (
                    <p>{dictionary.loadingNoCache}</p>
                  )}
                  {season.isFetching && season.data !== undefined && (
                    <p>{dictionary.fetching}</p>
                  )}
                  {!season.isFetching &&
                    season.data !== undefined &&
                    season.data.episodes.map((it) => (
                      <div
                        id={
                          (playlist.lastArgs?.[0].episodeId === it.id &&
                            playlist.lastArgs?.[0].titleId === data.id) ||
                          fetchingEpisodeScwsId === it.scws_id
                            ? `${sidebarId}_activeElement`
                            : undefined
                        }
                        key={it.id}
                        className={cn(
                          "relative mt-2 overflow-hidden rounded",
                          ((playlist.lastArgs?.[0].episodeId === it.id &&
                            playlist.lastArgs?.[0].titleId === data.id) ||
                            fetchingEpisodeScwsId === it.scws_id) &&
                            "opacity-50",
                        )}
                      >
                        <img alt="" src={`${sc!.cdn}/images/${it.cover}`} />

                        <div className="absolute left-0 top-0 flex h-full w-full flex-col bg-gradient-to-t from-neutral-900">
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <IconButton
                              disabled={
                                (playlist.lastArgs?.[0].episodeId === it.id &&
                                  playlist.lastArgs?.[0].titleId === data.id) ||
                                fetchingEpisodeScwsId === it.scws_id
                              }
                              over={() =>
                                !(
                                  (playlist.lastArgs?.[0].episodeId === it.id &&
                                    playlist.lastArgs?.[0].titleId ===
                                      data.id) ||
                                  fetchingEpisodeScwsId === it.scws_id
                                )
                              }
                              leave={() =>
                                !(
                                  (playlist.lastArgs?.[0].episodeId === it.id &&
                                    playlist.lastArgs?.[0].titleId ===
                                      data.id) ||
                                  fetchingEpisodeScwsId === it.scws_id
                                )
                              }
                              action={() => {
                                hls.current.detachMedia();
                                setLoading(false);
                                setPaused(true);
                                setCanPlay(false);
                                playlist.reset();
                                playlist.active();
                                video.current!.src = "";
                                setFetchingEpisodeScwsId(it.scws_id);
                                const seasonNumber = data.seasons.find(
                                  (it) => it.id === season.data!.id,
                                )!.number;
                                playlistFetch({
                                  scwsId: it.scws_id,
                                  titleId: data.id,
                                  episodeId: it.id,
                                  lastEpisodeNumber: it.number,
                                  lastSeasonNumber: seasonNumber,
                                }).then((_) => setFetchingEpisodeScwsId(-1));
                              }}
                              classNames={{
                                button: "[&.hover_svg]:text-black",
                              }}
                            >
                              {fetchingEpisodeScwsId === it.scws_id
                                ? dictionary.player.episodeFetching
                                : playlist.lastArgs?.[0].episodeId === it.id &&
                                    playlist.lastArgs?.[0].titleId === data.id
                                  ? dictionary.player.episodePlaying
                                  : (className) => (
                                      <IcBaselinePlayArrow
                                        className={cn(
                                          className,
                                          "text-neutral-300",
                                        )}
                                      />
                                    )}
                            </IconButton>
                          </div>

                          <div className="flex h-full w-full items-end justify-end">
                            <Text>{it.number}</Text>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </React.Fragment>
        )}

        {(loading ||
          (!canPlay && playlist.data !== undefined) ||
          playlist.isFetching) && (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center justify-center pb-16">
            <EosIconsLoading className={cn("animate-spin text-neutral-300")} />
          </div>
        )}
      </div>
    </RemoveScroll>,
    document.body,
  );
}
