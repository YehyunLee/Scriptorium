import prisma from './prisma';

export async function upsertRating(userId, ratingValue, ratingType, entityId) {
    let whereClause = {};
    let dataClause = {
        rating: ratingValue,
        userId: userId
    };

    if (ratingType === 'blogPost') {
        whereClause = { userId: userId, blogPostId: parseInt(entityId) };
        dataClause.blogPostId = parseInt(entityId);
    } else if (ratingType === 'comment') {
        whereClause = { userId: userId, commentId: parseInt(entityId) };
        dataClause.commentId = parseInt(entityId);
    } else {
        throw new Error("Invalid rating type. Must be 'blogPost' or 'comment'.");
    }

    // Check if the user already rated the entity (blog post or comment)
    const existingRating = await prisma.rating.findFirst({
        where: whereClause
    });

    let rating;
    if (existingRating) {
        // Update the existing rating
        rating = await prisma.rating.update({
            where: { id: existingRating.id },
            data: { rating: ratingValue }
        });
    } else {
        // Create a new rating
        rating = await prisma.rating.create({
            data: dataClause
        });
    }

    return rating;
}
