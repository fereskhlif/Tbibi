export interface MedicalPictureAnalysisRequest {
  history: string;
  laboratoryResultId: number;

 
  imageName?: string;
  imageType?: string;
  imagePath?: string;
  category?: string;

 
  analysisResult?: string;
  confidenceScore?: number;
  status?: string;
  doctorNote?: string;


  uploadDate?: string;
  validationDate?: string;
}

export interface MedicalPictureAnalysisResponse {
  picId: number;
  history: string;
  laboratoryResultId: number;
  testName: string;
  nameLabo: string;
  imageName: string;
  imageType: string;
  imagePath: string;
  category: string;
  analysisResult: string;
  confidenceScore: number;
  status: string;
  doctorNote: string;
  uploadDate: string;
  validationDate: string;
}