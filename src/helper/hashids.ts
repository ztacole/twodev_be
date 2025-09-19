import Hashids from "hashids";

export const hashids = new Hashids(process.env.HASH_SALT, 64);

export const getAssesseeUrl = (id: number) => {
	const encodedId = hashids.encode(id);
	return `${process.env.APP_URL}/public/data-asesi/${encodedId}`;
};

export const getAssessorUrl = (id: number) => {
	const encodedId = hashids.encode(id);
	return `${process.env.APP_URL}/public/data-asesor/${encodedId}`;
};

export const decodeId = (id: string) => hashids.decode(id)[0];
