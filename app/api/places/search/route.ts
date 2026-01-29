import { NextRequest, NextResponse } from "next/server";

interface PlaceResult {
    name: string;
    address: string;
    phoneNumber: string | null;
    rating: number | null;
    totalRatings: number | null;
    placeId: string;
    isOpen: boolean | null;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("query");
        const location = searchParams.get("location");
        const limit = parseInt(searchParams.get("limit") || "5", 10);
        const preferredCriteria = searchParams.get("preferredCriteria") as "cheapest" | "fastest" | "nearest" | "best_rated" | null;

        if (!query) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_PLACES_API_KEY) {
            return NextResponse.json(
                { error: "Google Places API key not configured" },
                { status: 500 }
            );
        }

        // Build the search query - combine service query with location
        const searchQuery = location ? `${query} in ${location}` : query;

        // Step 1: Text Search to find places
        const textSearchUrl = new URL(
            "https://maps.googleapis.com/maps/api/place/textsearch/json"
        );
        textSearchUrl.searchParams.set("query", searchQuery);
        textSearchUrl.searchParams.set("key", process.env.GOOGLE_PLACES_API_KEY);

        const textSearchResponse = await fetch(textSearchUrl.toString());
        const textSearchData = await textSearchResponse.json();

        if (textSearchData.status !== "OK" && textSearchData.status !== "ZERO_RESULTS") {
            console.error("Google Places Text Search error:", textSearchData);
            return NextResponse.json(
                { error: `Google Places API error: ${textSearchData.status}` },
                { status: 500 }
            );
        }

        if (!textSearchData.results || textSearchData.results.length === 0) {
            return NextResponse.json({ results: [], message: "No businesses found" });
        }

        // Step 2: Get details for each place (to get phone numbers)
        // Limit to requested number of results
        const placesToFetch = textSearchData.results.slice(0, limit);

        const detailedResults: PlaceResult[] = await Promise.all(
            placesToFetch.map(async (place: any) => {
                try {
                    const detailsUrl = new URL(
                        "https://maps.googleapis.com/maps/api/place/details/json"
                    );
                    detailsUrl.searchParams.set("place_id", place.place_id);
                    detailsUrl.searchParams.set(
                        "fields",
                        "name,formatted_address,formatted_phone_number,rating,user_ratings_total,opening_hours"
                    );
                    detailsUrl.searchParams.set("key", process.env.GOOGLE_PLACES_API_KEY!);

                    const detailsResponse = await fetch(detailsUrl.toString());
                    const detailsData = await detailsResponse.json();

                    if (detailsData.status === "OK" && detailsData.result) {
                        const result = detailsData.result;
                        return {
                            name: result.name || place.name,
                            address: result.formatted_address || place.formatted_address,
                            phoneNumber: result.formatted_phone_number || null,
                            rating: result.rating || null,
                            totalRatings: result.user_ratings_total || null,
                            placeId: place.place_id,
                            isOpen: result.opening_hours?.open_now ?? null,
                        };
                    }

                    // Fallback to basic info if details fetch fails
                    return {
                        name: place.name,
                        address: place.formatted_address,
                        phoneNumber: null,
                        rating: place.rating || null,
                        totalRatings: place.user_ratings_total || null,
                        placeId: place.place_id,
                        isOpen: place.opening_hours?.open_now ?? null,
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${place.name}:`, error);
                    return {
                        name: place.name,
                        address: place.formatted_address,
                        phoneNumber: null,
                        rating: place.rating || null,
                        totalRatings: place.user_ratings_total || null,
                        placeId: place.place_id,
                        isOpen: place.opening_hours?.open_now ?? null,
                    };
                }
            })
        );

        // Filter and rank results based on criteria
        const resultsWithPhones = detailedResults.filter((r) => r.phoneNumber);
        const resultsWithoutPhones = detailedResults.filter((r) => !r.phoneNumber);

        // Sort results based on preferredCriteria and prioritize open businesses
        const sortResults = (results: PlaceResult[]) => {
            return results.sort((a, b) => {
                // First priority: Open businesses (if we have that info)
                if (a.isOpen !== null && b.isOpen !== null) {
                    if (a.isOpen && !b.isOpen) return -1;
                    if (!a.isOpen && b.isOpen) return 1;
                }

                // Second priority: preferredCriteria
                if (preferredCriteria) {
                    switch (preferredCriteria) {
                        case "best_rated":
                            // Higher rating first, then more reviews
                            if (a.rating !== null && b.rating !== null) {
                                if (a.rating !== b.rating) return b.rating - a.rating;
                                return (b.totalRatings || 0) - (a.totalRatings || 0);
                            }
                            if (a.rating !== null) return -1;
                            if (b.rating !== null) return 1;
                            break;

                        case "nearest":
                            // Google's default ranking already considers distance
                            // We could enhance this by calculating actual distances if needed
                            break;

                        case "fastest":
                            // For "fastest", prioritize businesses that are open now
                            // and have higher ratings (likely more efficient)
                            if (a.isOpen !== null && b.isOpen !== null) {
                                if (a.isOpen && !b.isOpen) return -1;
                                if (!a.isOpen && b.isOpen) return 1;
                            }
                            // Then by rating as a proxy for efficiency
                            if (a.rating !== null && b.rating !== null) {
                                return b.rating - a.rating;
                            }
                            break;

                        case "cheapest":
                            // Google Places doesn't provide pricing info
                            // We'll prioritize by rating as a proxy for value
                            if (a.rating !== null && b.rating !== null) {
                                return b.rating - a.rating;
                            }
                            break;
                    }
                }

                // Default: keep Google's original ranking
                return 0;
            });
        };

        const sortedWithPhones = sortResults(resultsWithPhones);
        const sortedWithoutPhones = sortResults(resultsWithoutPhones);

        return NextResponse.json({
            results: [...sortedWithPhones, ...sortedWithoutPhones],
            totalFound: textSearchData.results.length,
            withPhoneNumbers: resultsWithPhones.length,
            criteria: preferredCriteria,
        });
    } catch (error) {
        console.error("Places search error:", error);
        return NextResponse.json(
            { error: "Failed to search for businesses" },
            { status: 500 }
        );
    }
}
