import { useEffect, useState } from 'react';
import {
    subscribeToPostInterests,
    subscribeToPostMeetings,
} from '../services/firestore';

// Subscribes to the /posts/{postId}/interests and /posts/{postId}/meetings
// subcollections and returns the live arrays. Used by PostDetail. Avoids
// loading the entire list of interests/meetings for every post in the feed —
// Dashboard just reads the `interestCount` / `meetingCount` denormalized
// counters on the post document.
export function usePostEngagement(postId) {
    const [interests, setInterests] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!postId) {
            // Reset subscription state when postId becomes nullish; the effect
            // is synchronizing with an external system (Firestore), so these
            // setStates are intentional resets, not cascading renders.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInterests([]);
             
            setMeetings([]);
             
            setLoaded(true);
            return;
        }

        let gotInterests = false;
        let gotMeetings = false;
        const markLoaded = () => {
            if (gotInterests && gotMeetings) setLoaded(true);
        };

        let unsubInterests = () => {};
        let unsubMeetings = () => {};
        try {
            unsubInterests = subscribeToPostInterests(postId, (items) => {
                setInterests(items);
                gotInterests = true;
                markLoaded();
            });
            unsubMeetings = subscribeToPostMeetings(postId, (items) => {
                setMeetings(items);
                gotMeetings = true;
                markLoaded();
            });
        } catch (err) {
            console.error('usePostEngagement subscribe error:', err);
            setLoaded(true);
        }

        return () => {
            try { unsubInterests(); } catch { /* noop */ }
            try { unsubMeetings(); } catch { /* noop */ }
        };
    }, [postId]);

    return { interests, meetings, loaded };
}
