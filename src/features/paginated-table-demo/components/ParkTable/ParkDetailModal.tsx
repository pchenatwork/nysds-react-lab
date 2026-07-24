import { useEffect, useState } from "react";
import {
  NysModal,
  NysButton,
  NysBadge,
  NysIcon,
  NysDivider,
} from "@nysds/components/react";
import { fetchParkById } from "./parksApi";
import type { Park } from "./types";
import "./styles.css";

const numberFormat = new Intl.NumberFormat("en-US");
// Compact notation so large visitor counts read as "804K" rather than "804,000".
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact" });

interface ParkDetailModalProps {
  /** Id of the park to show, or `null` when the modal is closed. */
  parkId: number | null;
  onClose: () => void;
}

/**
 * ParkDetailModal — a controlled modal that, given only a park **id**, looks the
 * full record up itself (via `fetchParkById`) and renders its detail. Decoupled
 * from the table's in-memory page data, so it behaves like a real detail view
 * that re-fetches by id.
 */
const ParkDetailModal = ({ parkId, onClose }: ParkDetailModalProps) => {
  const [park, setPark] = useState<Park | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parkId === null) return; // modal closed; nothing to fetch

    // Guard against out-of-order responses: if parkId changes (or the component
    // unmounts) before the promise resolves, ignore its result.
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading flag before an async fetch (react-hooks v7 rule)
    setLoading(true);

    fetchParkById(parkId).then((res) => {
      if (ignore) return;
      setPark(res ?? null);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [parkId]);

  return (
    <NysModal
      width="lg"
      heading={loading ? "Loading…" : (park?.parkName ?? "Park not found")}
      //subheading={park ? `${park.region} Region · ${park.county} County` : ""}
      open={parkId !== null}
      onNysClose={onClose}
    >
      {loading || !park ? (
        <p>{loading ? "Loading park details…" : "Park not found."}</p>
      ) : (
        <div className="park-card">
          {/* Location + rating: address on the left, gold rating badge on the right. */}
          <div className="park-card__top">
            <span className="park-card__location">
              {park.region} Region · {park.county} County ·
              <NysIcon name="location_on" size="sm" />
              {park.address.street}, {park.address.city}, {park.address.state}{" "}
              {park.address.zipCode} · Admission:{" "}
              {park.admissionFee > 0 ? `$${park.admissionFee}` : "Free"}
            </span>
            {/* No "star" icon in the built-in set, so the ★ lives in the label. */}
            <NysBadge
              intent="warning"
              variant="strong"
              label={`★ ${park.rating.toFixed(1)}`}
            />
          </div>

          {/* Status chips. */}
          <div className="park-card__chips">
            {park.openYearRound && (
              <NysBadge intent="neutral" label="Open year-round" />
            )}
            <NysBadge
              intent="neutral"
              prefixIcon="schedule"
              label={park.hours}
            />
            <NysBadge
              intent="neutral"
              label={park.petFriendly ? "Pet friendly" : "No pets"}
            />

            {park.activities.length > 0 &&
              park.activities.map((activity) => (
                <NysBadge key={activity} intent="success" label={activity} />
              ))}
          </div>

          <NysDivider />

          {/* Three side-by-side two-column (label | value) lists. */}
          <div className="park-card__columns">
            <dl className="park-card__list">
              <div className="park-card__row">
                <dt className="park-card__row-label">
                  <NysIcon name="phone_in_talk" size="sm" />
                  Phone
                </dt>
                <dd className="park-card__row-value">
                  <a className="park-card__link" href={`tel:${park.phone}`}>
                    {park.phone}
                  </a>
                </dd>
              </div>
              <div className="park-card__row">
                <dt className="park-card__row-label">Acres</dt>
                <dd className="park-card__row-value">
                  {numberFormat.format(park.acreage)}
                </dd>
              </div>
              <div className="park-card__row">
                <dt className="park-card__row-label">Established</dt>
                <dd className="park-card__row-value">{park.established}</dd>
              </div>
            </dl>

            <dl className="park-card__list">
              <div className="park-card__row">
                <dt className="park-card__row-label">Trail miles</dt>
                <dd className="park-card__row-value">{park.trailsMiles}</dd>
              </div>
              <div className="park-card__row">
                <dt className="park-card__row-label">Visitors / year</dt>
                <dd className="park-card__row-value">
                  {compactFormat.format(park.annualVisitors)}
                </dd>
              </div>
            </dl>

            <dl className="park-card__list">
              <div className="park-card__row">
                <dt className="park-card__row-label">Parking</dt>
                <dd className="park-card__row-value">
                  {numberFormat.format(park.parkingSpaces)} spaces
                </dd>
              </div>
              <div className="park-card__row">
                <dt className="park-card__row-label">Campsites</dt>
                <dd className="park-card__row-value">
                  {park.campSites > 0
                    ? numberFormat.format(park.campSites)
                    : "None"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      <div slot="actions">
        {park && (
          <NysButton
            label="Visit website"
            variant="outline"
            size={"sm"}
            href={park.website}
            target="_blank"
            suffixIcon="open_in_new"
          />
        )}
        <NysButton size={"sm"} label="Close" onNysClick={onClose} />
      </div>
    </NysModal>
  );
};

export default ParkDetailModal;
