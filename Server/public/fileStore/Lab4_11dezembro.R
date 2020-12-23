# Logistic Regression, LDA QDA and KNN


########################
# 1. Logistic Regression
library(ISLR) 
attach(Smarket)
## find the indecies for the observations in Smarket that consitutes the training
## and testing data
train = Year < 2005 
test = !train

training_data = Smarket[train, -8] 
testing_data = Smarket[test, -8]

testing_y = Direction[test]

logistic_model = glm(Direction ~ Lag1 + Lag2, data = training_data, family = "binomial")

logistic_probs = predict(logistic_model, testing_data, type = "response") 
head(logistic_probs)

logistic_pred_y = rep("Down", length(testing_y)) 
logistic_pred_y[logistic_probs > 0.5] = "Up"

## the following command creates the confusion matrix 
table(logistic_pred_y, testing_y)
# misclassification error rate:
mean(logistic_pred_y != testing_y)  #0.4404762



#######################################
# 2. Linear Discriminant Analysis (LDA)
library(MASS)
lda_model = lda(Direction~Lag1 + Lag2, data = training_data)
lda_model
# a) It returns proportions for each class
#    summary(Smarket[train,]$Direction)
#    491/(491+507)
# b) It  returns the group means, i.e. average of each predictor within each class, and
#    are used by LDA as estimates of μk. These suggest that there is a tendency for the 
#    previous 2 days’ returns to be negative on days when the market increases, and a
#    tendency for the previous days’ returns to be positive on days when the market declines.
#    mean(training_data[training_data$Direction=="Up",]$Lag1)
#    mean(training_data[training_data$Direction=="Up",]$Lag2)
# c) It returns coefficients of linear discriminants output provides the linear combination 
#    of Lag1 and Lag2 that are used to form the LDA decision rule.  
#    If −0.642 × Lag1 − 0.514 × Lag2 is large, then the LDA classifier will predict a market 
#    increase, and if it is small, then the LDA classifier will predict a market decline.
#

lda_pred = predict(lda_model, testing_data) 
names(lda_pred)
lda_pred_y = lda_pred$class

## compute the confusion matrix 
table(lda_pred_y, testing_y)
## compute the misclassification error rate 
mean(lda_pred_y != testing_y)  # 0.4404762



##########################################
# 3. Quadratic Discriminant Analysis (QDA)
library(MASS)
qda_model = qda(Direction~Lag1 + Lag2, data = training_data) 
qda_pred = predict(qda_model, testing_data) 
qda_pred_y = qda_pred$class
table(qda_pred_y, testing_y)
mean(qda_pred_y != testing_y) #0.4007937  melhor!



###########################
# 4. KNN for Classification
## load the class R package. 
library(class)

# For knn(), we have to have our y variable in a seperate column from the training and testing data. 
# In addition to this issue, we have to scale or standardize our numerical variables because the KNN 
# method classifies observations using distance measures.

# Let us scale the continuous variables Lag1 and Lag2
# (excluding Direction and Today because it's highly correlated with Direction)
data = scale(Smarket[,-c(1,4:9)])
training_data = data[train,] 
testing_data = data[test,]

## KNN take the training response variable separately 
training_y = Smarket$Direction[train]
## we also need the have the testing_y separately for assesing the model later on 
testing_y = Smarket$Direction[test]

set.seed(1)
knn_pred_y = knn(training_data, testing_data, training_y, k = 1) 
table(knn_pred_y, testing_y)
mean(knn_pred_y != testing_y) #0.50 pior!

# Let’s see what value of k would give us the lowest misclassification error rate.
knn_pred_y = NULL 
error_rate = NULL

for(i in 1:300){
  set.seed(1)
  knn_pred_y = knn(training_data,testing_data,training_y,k=i)
  error_rate[i] = mean(testing_y != knn_pred_y) 
}

min(error_rate)
which.min(error_rate)
library(ggplot2)
qplot(1:300, error_rate, xlab = "K",
      ylab = "Error Rate", geom=c("point", "line"))


# CONCLUSION: 
# Best model for this data set would be either the logistic regression or LDA model 
# because they have the least misclasslifcation error

